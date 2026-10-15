import { afterEach, describe, expect, it, vi } from "vitest";
import {
	platformFetch,
	itchProject,
	scratchProjects,
	validateGithubSite,
	verifyScratchProject,
} from "./showcaseRemote";
afterEach((): void => {
	vi.unstubAllGlobals();
});
describe("public project integrations", (): void => {
	it("rejects arbitrary hosts and redirects before fetching them", async (): Promise<void> => {
		const fetch = vi.fn().mockResolvedValue(
			new Response(null, {
				status: 302,
				headers: { location: "http://127.0.0.1/private" },
			}),
		);
		vi.stubGlobal("fetch", fetch);
		await expect(
			platformFetch("https://example.org/secret"),
		).rejects.toMatchObject({ statusCode: 400 });
		expect(fetch).not.toHaveBeenCalled();
		await expect(
			platformFetch("https://game.itch.io/play"),
		).rejects.toMatchObject({ statusCode: 400 });
		expect(fetch).toHaveBeenCalledTimes(1);
	});
	it("normalizes only public Scratch projects belonging to the linked username", async (): Promise<void> => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				Response.json([
					{
						id: 42,
						title: "Space game",
						description: "Fly!",
						public: true,
						author: { username: "Ada" },
						image: "https://uploads.scratch.mit.edu/image.png",
					},
					{
						id: 43,
						title: "Private",
						public: false,
						author: { username: "Ada" },
					},
					{
						id: 44,
						title: "Other",
						public: true,
						author: { username: "SomeoneElse" },
					},
				]),
			),
		);
		expect(await scratchProjects("ada", 0)).toEqual([
			{
				sourceProjectId: "42",
				title: "Space game",
				description: "Fly!",
				url: "https://scratch.mit.edu/projects/42/",
				imageUrl: "https://uploads.scratch.mit.edu/image.png",
			},
		]);
	});
	it("imports itch.io metadata without account credentials", async (): Promise<void> => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(
						'<meta content="My &amp; Game" name="twitter:title"><meta property="og:description" content="Make things"><meta property="og:image" content="https://img.itch.zone/cover.png">',
					),
				),
		);
		expect(await itchProject("https://ada.itch.io/my-game")).toMatchObject({
			title: "My & Game",
			description: "Make things",
			imageUrl: "https://img.itch.zone/cover.png",
		});
	});
	it("requires configured GitHub account and a published site", async (): Promise<void> => {
		const fetch = vi
			.fn()
			.mockResolvedValueOnce(new Response("Not found", { status: 404 }))
			.mockResolvedValueOnce(new Response("<h1>My site</h1>", { status: 200 }));
		vi.stubGlobal("fetch", fetch);
		await expect(validateGithubSite(null)).rejects.toMatchObject({
			statusCode: 400,
		});
		await expect(validateGithubSite("ada")).rejects.toMatchObject({
			statusCode: 422,
		});
		expect(await validateGithubSite("Ada")).toBe("https://ada.github.io/");
	});
	it("accepts a public custom-domain redirect without fetching that host", async (): Promise<void> => {
		const request = vi.fn().mockResolvedValue(
			new Response(null, {
				status: 301,
				headers: { location: "https://www.example.org/" },
			}),
		);
		vi.stubGlobal("fetch", request);
		expect(await validateGithubSite("ada")).toBe("https://ada.github.io/");
		expect(request).toHaveBeenCalledTimes(1);
	});
	it("lists Geekymonkey projects when Scratch returns an author ID without a username", async (): Promise<void> => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(
					async (url: URL | string): Promise<Response> =>
						Response.json(
							String(url).includes("/projects?")
								? [
										{
											id: 823343923,
											title: "Godot",
											description: "Game",
											public: true,
											is_published: true,
											author: { id: 1062081 },
										},
									]
								: { id: 1062081, username: "geekymonkey" },
						),
				),
		);
		expect(
			(await scratchProjects("Geekymonkey", 0)).map(
				(project): string => project.title,
			),
		).toEqual(["Godot"]);
	});
	it("validates a selected Scratch project by numeric author ID before saving", async (): Promise<void> => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(
					async (url: URL | string): Promise<Response> =>
						Response.json(
							String(url).includes("/projects/")
								? { author: { id: 1062081 }, public: true, is_published: true }
								: { id: 1062081 },
						),
				),
		);
		await expect(
			verifyScratchProject("Geekymonkey", "823343923"),
		).resolves.toBeUndefined();
	});
	it("rejects a selected project owned by a different Scratch account", async (): Promise<void> => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(
					async (url: URL | string): Promise<Response> =>
						Response.json(
							String(url).includes("/projects/")
								? { author: { id: 123 }, public: true }
								: { id: 1062081 },
						),
				),
		);
		await expect(
			verifyScratchProject("Geekymonkey", "823343923"),
		).rejects.toMatchObject({ statusCode: 400 });
	});
});
