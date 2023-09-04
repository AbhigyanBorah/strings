"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Strings from "../models/strings.model";
import { FilterQuery, SortOrder } from "mongoose";

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

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy="desc",
}: {
        userId: string;
        searchString?: string;
        pageNumber?: number;
        pageSize?: number;
        sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query:FilterQuery<typeof User> = {
            id:{$ne:userId}
        }

        if (searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);

        const totalUserCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUserCount > skipAmount + users.length;

        return {users, isNext}
        
    } catch (error:any) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDB();

        //find all threads created by the user
        const userStrings = await Strings.find({ author: userId });
        
        //Collect all the child thread ids (replies) from the 'children' field
        const childStringsIds = userStrings.reduce((acc, userStrings) => {
            return acc.concat(userStrings.children)
        },[])

        //find all the strings that the user has replied to
        const replies = await Strings.find({
            _id: { $in: childStringsIds },
            author:{$ne:userId}
        }).populate({
            path: 'author',
            model: User,
            select:'name image _id'
        })

        return replies;

    } catch (error:any) {
        throw new Error(`Failed to fetch activity: ${error.message}`);
    }

}