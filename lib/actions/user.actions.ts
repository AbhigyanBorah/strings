"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Strings from "../models/strings.model";

interface Params{
    userId:string,
    username:string,
    name:string,
    bio:string,
    image:string,
    path:string,
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
}:Params): Promise<void>{
    connectToDB();

    try {
        await User.findOneAndUpdate(
            {
                id: userId
            },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded:true,
            },
            {
                upsert:true //upsert means updating and inserting
            }
        );
    
        if (path == '/profile/edit') {
            revalidatePath(path);
        }
    
   } catch (error:any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
   }

}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({ id: userId })
        //     .populate({
        //     path: 'communities',
        //     model:'community'
        // })
    } catch (error:any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        //TODO: populate community

        //Find all strings authored by the user and with the given userId
        const strings = await User.findOne({ id: userId })
            .populate({
                path: 'strings',
                model: Strings,
                populate: {
                    path: 'children',
                    model: Strings,
                    populate: {
                        path: 'author',
                        model: User,
                        select:'name image id'
                    }
                }
            })
        
        return strings;
    } catch (error:any) {
        throw new Error(`Failed to fetch user strings: ${error.message}`);
    }
}