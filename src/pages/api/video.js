
const VideoDisplay = () => {
    const videoData = {
        title: "Body Weight Training Session",
        driveUrl: "https://drive.google.com/file/d/1TloKBUyEhQwbxxzgSsrWHx2qJvgSv7AH/preview",
        description: "Unlock the full potential of bodyweight exercises with this focused 50-minute training session designed to enhance strength and endurance. In this video, we cover:",
        highlights: [
            "Master the proper form for push-ups to optimize strength development",
            "Engage in bodyweight squats to build lower body and core strength",
            "Incorporate planks to strengthen and stabilize the core",
            "Complete full-body workout routine aimed at improving overall strength and endurance"
        ],
        trainer: "Ansul Rathi",
        duration: "48 minutes",
        level: "Beginner"
    };

    return (
        <div className="min-h-screen bg-zinc-900 py-12 px-4 pt-24">
            <div className="max-w-6xl mx-auto">
                {/* Video Title */}
                <h1 className="text-3xl font-bold text-white mb-6">
                    {videoData.title}
                </h1>

                {/* Video Player */}
                <div className="relative w-full aspect-video bg-zinc-800 rounded-lg overflow-hidden mb-8">
                    <iframe
                        src={videoData.driveUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; encrypted-media"
                        loading="lazy"
                        allowFullScreen={false}
                        webkitallowfullscreen="false"
                        mozallowfullscreen="false"
                    ></iframe>
                </div>

                {/* Video Information */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Description */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-zinc-800 rounded-lg p-6">
                            <p className="text-gray-300 mb-4">
                                {videoData.description}
                            </p>
                            <ul className="space-y-2">
                                {videoData.highlights.map((highlight, index) => (
                                    <li key={index} className="flex items-center gap-2 text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Video Details */}
                    <div className="space-y-4">
                        <div className="bg-zinc-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Video Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-gray-400 text-sm">Trainer</p>
                                    <p className="text-white">{videoData.trainer}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Duration</p>
                                    <p className="text-white">{videoData.duration}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Level</p>
                                    <p className="text-white">{videoData.level}</p>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 rounded-lg p-6">
                            <h3 className="text-black font-semibold mb-2">Join Our Classes</h3>
                            <p className="text-zinc-900 mb-4">Experience personalized training sessions with expert guidance.</p>
                            <a 
                                href="https://wa.me/918107505074?text=I%20want%20to%20join%20!!!"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-black text-white py-2 px-2 rounded-lg hover:bg-zinc-800 transition-colors text-center"
                            >
                                Book Trial Class
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDisplay;