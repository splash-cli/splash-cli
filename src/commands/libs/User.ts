import fs from "fs";
import path from "path";
import http from "http";

import Ora from "ora";
import terminalLink from "terminal-link";
import chalk from "chalk";

import { prompt } from "inquirer";
import got from "got";

import { config } from "../../extra/config";
import {
	authenticatedRequest,
	errorHandler,
	authenticate,
	tryParse,
	printBlock,
	generateAuthenticationURL,
} from "../../extra/utils";
import { UnsplashPhoto } from "../../../declarations/Unsplash";

export default class User {
	static user = config.get("user") || {};

	static auth = {
		test: (): Promise<any> => {
			const user = config.get("user");

			return got("https://api.unsplash.com/me", {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			})
				.then(({ body }) => {
					const profile = JSON.parse(body);
					printBlock(chalk`{bold Welcome {cyan @${profile.username}}!}`);

					User.auth
						.logout(true)
						.then(() => {
							config.set("user", {
								profile,
								token: user.token,
								refresh: user.token,
							});

							process.exit();
						})
						.catch(errorHandler);
				})
				.catch(errorHandler);
		},
		login: () => {
			const spinner = Ora("Waiting...");
			const authURL = generateAuthenticationURL(
				"public",
				"read_user",
				"write_user",
				"read_photos",
				"write_photos",
				"write_likes",
				"write_followers",
				"read_collections",
				"write_collections",
			);

			http
				.createServer(async (req, res) => {
					const render = (filename: string) => {
						try {
							const html = fs.readFileSync(path.join(__dirname, "..", "..", "pages", filename + ".html"));
							res.writeHead(200, { "Content-Type": "text/html" });
							res.write(html);
							res.end();
						} catch (error) {
							errorHandler(error);
						}
					};

					const send = (data: any) => {
						try {
							res.writeHead(200, {
								"Content-Type": "text/html",
							});
							res.write(data);
							res.end();
						} catch (error) {
							errorHandler(error);
						}
					};

					const redirect = (to: string) => {
						res.writeHead(302, {
							Location: to,
						});
						res.end();
					};

					if (req.url == "/login") return redirect(authURL);

					if (/code/gi.test(String(req.url))) {
						if (!req.url) return;
						const _a = req.url.match(/code=(.*)/);
						if (!_a) return render("index");

						if (_a.length > 1 && _a[1]) {
							if (spinner) spinner.text = "Authenticating...";

							try {
								spinner.stop();
								const authorizationCode = _a[1];

								let { body } = await authenticate({
									client_id: "a70f2ffae3634a7bbb5b3f94998e49ccb2e85922fa3215ccb61e022cf57ca72c",
									client_secret: "0a86783ec8a023cdfa38a39e9ffab7f1c974e48389dc045a8e4b3978d6966e94",
									code: authorizationCode,
									redirect_uri: "http://localhost:5835",
								});

								let data: {
									error?: any;
									access_token: string;
									refresh_token: string;
									error_description: string;
								};

								if (typeof body == "string") {
									data = tryParse(body);
								} else {
									data = body;
								}

								if (data.error) {
									spinner.fail(data.error);

									send(data.error_description);
									errorHandler(new Error(data.error_description));

									setTimeout(() => {
										process.exit(0);
									}, 500);

									return;
								}

								config.set("user", {
									token: data.access_token,
									refresh: data.refresh_token,
									profile: {},
								});

								send("You can now close this tab.");

								spinner.stop();

								return User.auth.test();
							} catch (error) {
								send("An error is occurred. Please check you terminal app.");
								spinner.fail("Failed.");
								errorHandler(error);

								setTimeout(() => {
									process.exit(0);
								}, 500);

								return;
							}
						}
					}

					return render("index");
				})
				.listen(5835, () => {
					printBlock(
						chalk`{yellow {bold Splash CLI:} Please click on the link below to login}`,
						chalk`{cyan {dim ${terminalLink("Click Here", authURL)}}}`,
					);

					spinner.start();
				});
		},
		logout: async (force = false) => {
			if (force) {
				config.delete("user");
				return true;
			}

			const { isSure } = await prompt([
				{
					name: "isSure",
					message: "Are you sure?",
					default: false,
					type: "confirm",
				},
			]);

			if (isSure !== true) {
				console.log(chalk`{bold {red Aborted}}`);
				return false;
			}

			config.delete("user");
			return true;
		},
	};

	static async get() {
		let user;

		try {
			const data = await authenticatedRequest("me");
			config.set("user", { ...config.get("user"), profile: data });
			user = this.parseUser(data);
		} catch (error) {
			user = this.parseUser(config.get("user").profile);
		}

		return user;
	}

	static parseUser(user: Profile) {
		return chalk`
			{yellow Name}: ${user.name} {dim (@${user.username})}
			{yellow Bio}: ${user.bio
				.trim()
				.split("\n")
				.map((item: string) => item.replace(/^\s|\s$/g, ""))
				.join("\n")}
			{yellow Location}: ${user.location}

			{dim —————————————————————————————————————————}

			{yellow Downloads Count}: ${String(user.downloads)}
			{yellow Photos Count}: ${String(user.photos.length)}

			{dim —————————————————————————————————————————}

			{yellow Followers}: ${String(user.followers_count)}
			{yellow Following}: ${String(user.following_count)}
		`
			.split("\n")
			.map((item: string) => "  " + item.trim())
			.join("\n");
	}

	static async update(payload: any) {
		return await authenticatedRequest("me", {
			method: "PUT",
			body: JSON.stringify(payload, null, 2),
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	static async getLikes() {
		const {
			profile: { username, total_likes: totalLikes },
		} = config.get("user");
		const likedPhotos: any[] = [];

		const photos = await authenticatedRequest(`users/${username}/likes`);

		photos.map((photo: UnsplashPhoto) => {
			likedPhotos.push({
				id: photo.id,
				html: photo.links.html,
				download: photo.links.download_location,
				user: {
					username: photo.user.username,
					name: photo.user.name,
					profile: photo.user.links.html,
				},
			});
		});

		return likedPhotos;
	}

	static getCollections() {}

	static async likePhoto(id: string) {
		return await authenticatedRequest(`photos/${id}/like`, {
			method: "POST",
		});
	}
}
