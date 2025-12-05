import { Context } from "hono";
import { CreatePostParamsVariables } from "./types.js";
import { createPostService } from "./service.js";
export const CreatePostController = async (c: Context<{ Variables: CreatePostParamsVariables }>) => {
    const { authorId, title, content, postTags } = c.get("createPostParams")
    await createPostService({ authorId, title, content, postTags })
    return c.json({ message: "Your fitness thought is now live!" }, 201)
}