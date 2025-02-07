"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LiveStreamPage() {
  
  // Output Stream consts
  const [messages, setMessages] = useState([]);
  const [colo, setColo] = useState("green")
  const [error, setError] = useState(null);
  const outputRef = useRef(null);
  
  const [videoUrl, setVideoUrl] = useState("");
  const [subtitles, setSubtitles] = useState([
    "Welcome to the live stream!",
    "Enjoy the show and stay tuned for more updates.",
  ]);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentSubtitle(subtitles[0]);
    setInterval(() => {
      setSubtitles((prev) => prev.slice(1));
      setCurrentSubtitle(subtitles[0]);
    }, 5000);
    fetchStream();

  };


    const fetchStream = async () => {
      try {

        let videoid= videoUrl.replace('https://www.youtube.com/watch?v=', '')
        const response = await fetch('http://127.0.0.1:8000/json-stream?text=' + videoid);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();


        const readStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            console.log(messages)
            if (done) {
              setMessages((prev) => [...prev, 'Stream ended.']);
              break;
            }


            const chunk = decoder.decode(value, { stream: true });
            chunk.split('\n').forEach((line) => {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  console.log(data.mes)
                  const message = `Message: ${''+ data.mes.text}, Result: ${data.result}`;
                  console.log(data.result);
                  setColo(colo);
                  setMessages((prev) => [...prev, message]);
                } catch (err) {
                  console.error('Error parsing JSON:', err);
                }
              }
            });

            if (outputRef.current) {
              outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
          }
        };

        await readStream();
      } catch (err) {
        console.error('Error connecting to the stream:', err);
        setError('Error connecting to the stream.');
      }
    };


  return (
    <div className="flex flex-col items-center justify-start bg-gray-900 text-white min-h-screen">
      {/* Sticky Navbar */}
      <header className="w-full p-4 bg-gray-800 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-bold">Live Stream</h1>
        <button
          className="bg-red-600 py-2 px-4 rounded text-white"
          onClick={() => {
            router.push("/");
          }}
        >
          Go Back
        </button>
      </header>

      {/* Search Bar */}
      <div className="w-full max-w-4xl p-4">
        <form
          className="flex justify-center"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            className="w-full p-2 rounded-l bg-gray-700 text-white border border-gray-600"
            placeholder="Enter YouTube video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 py-2 px-4 rounded-r text-white" >
            Search
          </button>
        </form>
      </div>

      {/* Video Section */}
      <div className="w-full flex flex-row">
      <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg shadow-lg mt-4">
        {videoUrl ? (
          <iframe
            width="100%"
            height="500"
            src={videoUrl.replace("watch?v=", "embed/")}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        ) : (
            <div className="w-full h-[500px] bg-gray-700 flex items-center justify-center rounded-lg">
            <p className="text-center text-gray-500">
              Enter a video URL to start streaming.
            </p>
          </div>
        )}
      </div>
      

      {/* Subtitles Section */}
      <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg shadow-lg mt-4">
        <h2 className="text-xl font-bold mb-2">Subtitles</h2>
        <div className="bg-gray-900 p-4 rounded-lg text-lg">
        <div id="output" ref={outputRef}>
          {messages.map((msg, index) => (
            <div key={index} className= {`text-${colo}-500`}fff>{msg}</div>
          ))}
        </div>

        </div>

      </div>
      </div>
    </div>
  );
}