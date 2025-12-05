import { prisma } from "../../../prisma/prismaConfig.js"
import { CreatePostParams } from "./types.js"

export const createPost = async ({
    authorId,
    title,
    content,
    postTags
}: CreatePostParams): Promise<void> => {
    await prisma.post.create({
        data: {
            authorId: authorId,
            title: title,
            content: content,
            postTags: {
                create: postTags.map((tag) => ({
                    tags: {
                        connectOrCreate: {
                            where: { name: tag.toLowerCase() },
                            create: { name: tag.toLowerCase() }
                        }
                    }
                }))
            }
        }
    })
}