import * as z from 'zod';

export const UserValidation = z.object({
    profile_photo:z.string().url().nonempty(),
})