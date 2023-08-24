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
        const postQuery=Strings.find({parentId:{$in:[null,undefined]}}).sort({createdAt:'desc'})
    } catch (error) {
        
    }
}