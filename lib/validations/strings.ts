import * as z from 'zod';

export const StringValidation = z.object({
    strings: z.string().nonempty().min(3,{message: 'Minimum 3 characters required'}),
    accountId:z.string(),
});

export const CommentValidation = z.object({
    strings: z.string().nonempty().min(3,{message: 'Minimum 3 characters required'}),
})