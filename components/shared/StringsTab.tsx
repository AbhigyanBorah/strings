import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import StringCard from "../cards/StringCard";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const StringsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  //TODO: Fetch profile strings

  let result = await fetchUserPosts(accountId);

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.strings.map((post: any) => (
        <StringCard
          key={post._id}
          id={post._id}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: post.author.name,
                  image: post.author.image,
                  id: post.author.id,
                }
          } //todo
          comments={post.children}
          community={post.community} //todo
          content={post.text}
          createdAt={post.createdAt}
          currentUserId={currentUserId}
          parentId={post.parentId}
        />
      ))}
    </section>
  );
};

export default StringsTab;
