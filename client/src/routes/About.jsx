export default function About() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <div className="max-w-4xl">
          <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">About Me</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            On a Mission to Empower Underserved Communities
          </h1>
          <h2 className="py-5 text-2xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
            Who Am I
          </h2>
        </div>
        <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-400">
          Thank you for visiting my Page. My name is James Agao, and I'm a Full Stack Software
          Developer, concentrating in back-end and database technologies. My interest grew from
          being curious about the internet of things, while constantly observing the progression of
          emerging technologies. I wanted to be a part of that progression and it is where this
          passion that I wanted to pursue advancement in technologies with shared ideals, ethics,
          and philosophies. In this field, I am most fond in exploring and learning about emerging
          tech, researching, creating applications, and tinkering with new tech.
        </p>
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
          <div className="lg:pr-8">
            <h2 className="text-2xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white">
              My Mission
            </h2>

            <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-400">
              True progress is measured not only by innovation but by how far we lift each other up.
              Our mission is simple yet profound: to empower underserved communities with the tools,
              knowledge, and opportunities they need to thrive. We are driven by the belief that
              talent and potential exist everywhere — but access does not. That’s why we focus on
              creating pathways where barriers once stood. Through education, technology, and
              community-driven initiatives, we work to close gaps and open doors.
            </p>
            {/* <p className="mt-8 text-base/7 text-gray-600 dark:text-gray-400">
              Education & Experience: United States Navy San Francisco State University - B.A.
              Chemistry t3k-pirates - Full Stack Software Developer Eastern University - Masters of
              Science Data Science
            </p> */}
          </div>
          <div className="pt-16 lg:row-span-2 lg:-mr-16 xl:mr-auto">
            <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 xl:gap-8">
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 dark:shadow-none dark:outline-white/10">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?&auto=format&fit=crop&crop=center&w=560&h=560&q=90"
                  className="block size-full object-cover"
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40 dark:shadow-none dark:outline-white/10">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?&auto=format&fit=crop&crop=left&w=560&h=560&q=90"
                  className="block size-full object-cover"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 dark:shadow-none dark:outline-white/10">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?&auto=format&fit=crop&crop=left&w=560&h=560&q=90"
                  className="block size-full object-cover"
                />
              </div>
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40 dark:shadow-none dark:outline-white/10">
                <img
                  alt=""
                  src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?&auto=format&fit=crop&crop=center&w=560&h=560&q=90"
                  className="block size-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="max-lg:mt-16 lg:col-span-1">
            <p className="text-base/7 font-semibold text-gray-500 dark:text-gray-400">Education</p>
            <hr className="mt-6 border-t border-gray-200 dark:border-gray-700" />
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-y-2 border-b border-dotted border-gray-200 pb-4 dark:border-gray-700">
                <dt className="text-sm/6 text-gray-600 dark:text-gray-400">United States Navy </dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  <span>Veteran</span>
                </dd>
              </div>
              <div className="flex flex-col gap-y-2 border-b border-dotted border-gray-200 pb-4 dark:border-gray-700">
                <dt className="text-sm/6 text-gray-600 dark:text-gray-400">
                  San Francisco State University
                </dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  <span>Bachelor of Arts in Chemistry</span>
                </dd>
              </div>
              <div className="flex flex-col gap-y-2 max-sm:border-b max-sm:border-dotted max-sm:border-gray-200 max-sm:pb-4 dark:max-sm:border-gray-700">
                <dt className="text-sm/6 text-gray-600 dark:text-gray-400">Eastern University</dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  <span>Masters of Science Data Science</span>
                </dd>
              </div>
              <div className="flex flex-col gap-y-2">
                <dt className="text-sm/6 text-gray-600 dark:text-gray-400">
                  Full Stack Development
                </dt>
                <dd className="order-first text-6xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  <span> Bootcamp</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
