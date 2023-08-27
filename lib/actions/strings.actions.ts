"use server"

import { revalidatePath } from "next/cache";
import Strings from "../models/strings.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params{
    text: string,
    author: string,
    communityId: string|null,
    path:string    
}

export async function createString({ text, author, communityId, path }: Params) {
   
   try {
    connectToDB();

    const createdString = await Strings.create({
        text, author, community:null,
    });

    //Update user model
    await User.findByIdAndUpdate(author, {
        $push:{strings:createdString._id}
    })

       revalidatePath(path);
       
   } catch (error:any) {
    throw new Error(`Error creating string: ${error.message}`);
   }
    
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    try {
        connectToDB();

        //Calculate the number of posts to skip
        const skipAmount = (pageNumber - 1) * pageSize;

        //Fetch the posts that have no parents (top-level strings...)
        const postQuery = Strings.find({ parentId: { $in: [null, undefined] } })
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .limit(pageSize)
            .populate({
                path: 'author',
                model: User
            })
            .populate({
                path: 'children',
                populate: {
                    path: 'author',
                    model: User,
                    select: "_id name parentId image"
                }
            })
        
        const totalPostCount = await Strings.countDocuments({ parentId: { $in: [null, undefined] } })
        
        const posts = await postQuery.exec();

        const isNext = totalPostCount > skipAmount + posts.length;
        
        return { posts, isNext };

    } catch (error:any) {
        throw new Error(`An error while fetching posts : ${error.message}`)
    }
}

export async function fetchStringsById(id: string) {
    connectToDB();

    try {

        //TODO: populate community
        const strings = await Strings.findById(id).populate({
            path: 'author',
            model: User,
            select:"_id id name image"
        }).populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select:"_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Strings,
                    populate: {
                        path: 'author',
                        model: User,
                        select:"_id id name parentId image"
                    }
                }
            ]
        }).exec();

        return strings;

    } catch (error:any) {
        throw new Error(`Error fetching the thread: ${error.message}`);
    }
}

export async function addCommentToStrings(stringsId: string, commentText: string, userId: string, path: string) {
    connectToDB();

    try {
        //adding a comment

        //First find the original String by its ID
        const originalString = await Strings.findById(stringsId);
        
        if (!originalString) {
            throw new Error("String not found");
        }

        //Create a new String with the comment text
        const commentString = new Strings({
            text: commentText,
            author: userId,
            parentId:stringsId,
        })

        //Save the new String
        const savedCommentString = await commentString.save();

        //Update the original String to include the new comment
        originalString.children.push(savedCommentString._id);

        //Save the original String
        await originalString.save();

        revalidatePath(path);
        
    } catch (error:any) {
        throw new Error(`Error adding the comment: ${error.message}`);
    }
}