import Image from "./Image";
export default function Comment() {
  return (
    <div className="flex gap-6 mb-4 rounded-xl p-4 bg-gray-100">
      {/* <img src="/user.png" alt="User Avatar" className="w-12 h-12 rounded-full object-cover" /> */}
      <Image src={"/userImg.jpeg"} className="w-12 h-12 rounded-full object-cover" />
      <div className="flex flex-col gap-2">
        <h1 className="text-gray-500 font-semibold">John Doe</h1>
        <span className="text-sm text-gray-500">2 days ago</span>
        <div className="mt-4">
          <p className="text-gray-500 font-medium">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam vel vitae id quisquam
            recusandae, explicabo possimus dolores at laborum perspiciatis temporibus nobis
            obcaecati odit assumenda corporis! Nemo sit perspiciatis libero!
          </p>
        </div>
      </div>
    </div>
  );
}
