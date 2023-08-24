"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { usePathname, useRouter } from "next/navigation";

import { updateUser } from "@/lib/actions/user.actions";
import { StringValidation } from "@/lib/validations/strings";
import { createString } from "@/lib/actions/strings.actions";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

function PostString({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(StringValidation),
    defaultValues: {
      strings: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof StringValidation>) => {
    await createString({
      text: values.strings,
      author: userId,
      communityId: null,
      path: pathname,
    });

    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="strings"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          Post String
        </Button>
      </form>
    </Form>
  );
}

export default PostString;
