import PostString from "@/components/forms/PostString";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");
  // console.log(userInfo);
  return (
    <>
      <h1 className="head-text">Create String</h1>

      <PostString userId={userInfo._id.toString()} />
    </>
  );
}

export default Page;
