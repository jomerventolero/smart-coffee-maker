"use client";
import React, { useState, useEffect } from "react";
import { Coffee, Pause, Play, Settings, Home, AlertCircle } from "lucide-react";

export default function CoffeeMakerApp() {
  const [page, setPage] = useState("home");
  const [volume, setVolume] = useState(200);
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewProgress, setBrewProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [relayState, setRelayState] = useState("OFF");
  const [ledColor, setLedColor] = useState("red");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [espIP, setEspIP] = useState("");

  // Config state
  const [config, setConfig] = useState({
    brew200Duration: 165,
    brew400Duration: 330,
    brew600Duration: 495,
    maxBrewTime: 600,
    relayPin: 5,
    ledPin: 16,
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [configMessage, setConfigMessage] = useState("");

  // Use Next.js API proxy instead of direct ESP32 access
  const API_URL = "/api/esp";

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/config`);
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Config load failed:", err);
      }
    };
    loadConfig();
  }, [espIP]);

  // Poll status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/status`);
        const data = await res.json();
        setIsBrewing(data.isBrewing);
        setRelayState(data.relayState);

        // Update LED color based on brewing state
        if (data.isBrewing) {
          setLedColor("green");
        } else {
          setLedColor("red");
        }

        if (data.isBrewing) {
          const progress = (data.elapsedMs / data.totalDurationMs) * 100;
          setBrewProgress(Math.min(progress, 100));
          setRemainingTime(Math.ceil(data.remainingMs / 1000));
          setTotalTime(Math.ceil(data.totalDurationMs / 1000));
        } else {
          setBrewProgress(0);
          setRemainingTime(0);
        }
      } catch (err) {
        console.error("Status fetch failed:", err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [espIP]);

  const startBrew = async () => {
    setLoading(true);
    setMessage("");
    try {
      let duration;
      if (volume === 200) duration = config.brew200Duration * 1000;
      else if (volume === 400) duration = config.brew400Duration * 1000;
      else duration = config.brew600Duration * 1000;

      const res = await fetch(`${API_URL}/brew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volume, duration }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage("☕ Brewing started!");
        setIsBrewing(true);
        setLedColor("green");
        setTotalTime(duration / 1000);
      }
    } catch (err) {
      setMessage("Failed to connect to coffee maker");
    } finally {
      setLoading(false);
    }
  };

  const stopBrew = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stop`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage("Brewing stopped");
        setIsBrewing(false);
        setBrewProgress(0);
        setLedColor("red");
      }
    } catch (err) {
      setMessage("Failed to connect to coffee maker");
    } finally {
      setLoading(false);
    }
  };

  const activateRelay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/relay/off`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage("Relay deactivated - Brewing stopped");
        setIsBrewing(false);
        setBrewProgress(0);
        setRelayState("OFF");
        setLedColor("red");
      }
    } catch (err) {
      setMessage("Failed to control relay");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setConfigLoading(true);
    setConfigMessage("");
    try {
      const res = await fetch(`${API_URL}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (!res.ok) {
        setConfigMessage(`Error: ${data.error}`);
      } else {
        setConfigMessage("✅ Configuration saved successfully!");
        setTimeout(() => setConfigMessage(""), 3000);
      }
    } catch (err) {
      setConfigMessage("Failed to save configuration");
    } finally {
      setConfigLoading(false);
    }
  };

  const resetConfig = () => {
    setConfig({
      brew200Duration: 165,
      brew400Duration: 330,
      brew600Duration: 495,
      maxBrewTime: 600,
      relayPin: 5,
      ledPin: 16,
    });
    setConfigMessage("");
  };

  const resetESPIP = () => {
    setEspIP("http://192.168.18.78");
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  if (page === "config") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-amber-700 rounded-full opacity-10 animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-700 rounded-full opacity-5 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-gradient-to-b from-amber-50 to-yellow-50 rounded-3xl shadow-2xl overflow-hidden max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-900 to-amber-800 p-8 text-center sticky top-0">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Settings className="w-8 h-8 text-yellow-300" />
                <h1 className="text-3xl font-bold text-white">Configuration</h1>
              </div>
              <p className="text-amber-100 text-sm">Customize your brew</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* ESP32 IP Address */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-amber-900">
                  ESP32 IP Address
                </label>
                <input
                  type="text"
                  value={espIP}
                  onChange={(e) => setEspIP(e.target.value)}
                  placeholder="http://192.168.18.78"
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                />
                <p className="text-xs text-amber-700">
                  Enter the full address with http:// protocol
                </p>
              </div>

              {/* Brew 200mL Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-amber-900">
                  200mL Brew Duration (seconds)
                </label>
                <input
                  type="number"
                  min="30"
                  max="600"
                  value={config.brew200Duration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      brew200Duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                />
                <p className="text-xs text-amber-700">
                  ~{Math.floor(config.brew200Duration / 60)}:
                  {String(config.brew200Duration % 60).padStart(2, "0")}
                </p>
              </div>

              {/* Brew 400mL Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-amber-900">
                  400mL Brew Duration (seconds)
                </label>
                <input
                  type="number"
                  min="60"
                  max="600"
                  value={config.brew400Duration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      brew400Duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                />
                <p className="text-xs text-amber-700">
                  ~{Math.floor(config.brew400Duration / 60)}:
                  {String(config.brew400Duration % 60).padStart(2, "0")}
                </p>
              </div>

              {/* Brew 600mL Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-amber-900">
                  600mL Brew Duration (seconds)
                </label>
                <input
                  type="number"
                  min="90"
                  max="600"
                  value={config.brew600Duration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      brew600Duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                />
                <p className="text-xs text-amber-700">
                  ~{Math.floor(config.brew600Duration / 60)}:
                  {String(config.brew600Duration % 60).padStart(2, "0")}
                </p>
              </div>

              {/* Max Brew Time */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-amber-900">
                  Maximum Brew Time (seconds)
                </label>
                <input
                  type="number"
                  min="180"
                  max="1800"
                  value={config.maxBrewTime}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxBrewTime: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                />
                <p className="text-xs text-amber-700">
                  Safety limit - ~{Math.floor(config.maxBrewTime / 60)}:
                  {String(config.maxBrewTime % 60).padStart(2, "0")}
                </p>
              </div>

              {/* Relay Pin */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-amber-900">
                  Relay GPIO Pin
                </label>
                <input
                  type="number"
                  min="0"
                  max="39"
                  value={config.relayPin}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      relayPin: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                />
                <p className="text-xs text-amber-700">GPIO{config.relayPin}</p>
              </div>

              {/* LED Pin */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-amber-900">
                  LED GPIO Pin
                </label>
                <input
                  type="number"
                  min="0"
                  max="39"
                  value={config.ledPin}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ledPin: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                />
                <p className="text-xs text-amber-700">GPIO{config.ledPin}</p>
              </div>

              {/* Info Box */}
              <div className="bg-amber-100 border-l-4 border-amber-600 p-3 rounded">
                <p className="text-xs text-amber-900">
                  <span className="font-semibold">ℹ️ Tip:</span> Adjust brew
                  times to match your coffee maker's characteristics. Times are
                  in seconds.
                </p>
              </div>

              {/* Config Message */}
              {configMessage && (
                <div
                  className={`p-3 rounded-lg text-center text-sm font-medium ${
                    configMessage.includes("Error")
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {configMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetConfig}
                  disabled={configLoading}
                  className="py-3 rounded-lg font-semibold bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all active:scale-95"
                >
                  Reset Config
                </button>
                <button
                  onClick={saveConfig}
                  disabled={configLoading}
                  className="py-3 rounded-lg font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {configLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>

              <button
                onClick={resetESPIP}
                className="w-full py-3 rounded-lg font-semibold bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all active:scale-95"
              >
                Reset ESP IP
              </button>

              {/* Back Button */}
              <button
                onClick={() => setPage("home")}
                className="w-full py-3 rounded-lg font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>
            </div>

            {/* Footer */}
            <div className="bg-amber-100 px-8 py-4 text-center text-xs text-amber-800 border-t border-amber-200">
              ⚙️ Fine-tune your brewing experience
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 flex items-center justify-center p-4">
      {/* Background coffee beans animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-amber-700 rounded-full opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-700 rounded-full opacity-5 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-gradient-to-b from-amber-50 to-yellow-50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-amber-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
              <Coffee className="w-12 h-12 text-yellow-300" />
              <h1 className="text-3xl font-bold text-white">Smart Brew</h1>
            </div>
            <p className="text-amber-100 text-sm">Your perfect cup awaits</p>
          </div>

          {/* Main Content */}
          <div className="p-8 space-y-8">
            {/* LED Status Indicator */}
            <div className="flex justify-center">
              <div
                className={`w-8 h-8 rounded-full shadow-lg transition-all ${
                  ledColor === "green"
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                } ring-4 ${
                  ledColor === "green" ? "ring-green-300" : "ring-red-300"
                }`}
              ></div>
            </div>

            {/* Coffee Cup Animation */}
            <div className="flex justify-center">
              <div className="relative w-24 h-32">
                {/* Cup */}
                <div
                  className={`w-full h-full border-4 border-amber-800 rounded-b-3xl rounded-t-none relative overflow-hidden transition-all duration-300 ${
                    isBrewing
                      ? "bg-gradient-to-t from-amber-900 to-amber-700"
                      : "bg-amber-50"
                  }`}
                >
                  {/* Coffee liquid animation */}
                  {isBrewing && (
                    <>
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-amber-900 via-amber-800 to-transparent"
                        style={{
                          height: `${brewProgress}%`,
                          animation: "pour 2s ease-in-out infinite",
                        }}
                      ></div>
                      {/* Steam */}
                      <div
                        className="absolute -top-8 left-4 w-2 h-8 bg-white rounded-full opacity-40 animate-bounce"
                        style={{ animationDuration: "1s" }}
                      ></div>
                      <div
                        className="absolute -top-8 right-4 w-2 h-8 bg-white rounded-full opacity-30 animate-bounce"
                        style={{
                          animationDuration: "1.3s",
                          animationDelay: "0.2s",
                        }}
                      ></div>
                    </>
                  )}
                </div>
                {/* Cup handle */}
                <div className="absolute top-4 -right-6 w-6 h-12 border-4 border-amber-800 rounded-r-full"></div>
              </div>
            </div>

            {/* Status Display */}
            {isBrewing && (
              <div className="text-center space-y-3">
                <p className="text-amber-900 font-semibold text-lg">
                  Brewing in progress
                </p>
                <div className="text-4xl font-bold text-amber-800 font-mono">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-700 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${brewProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-amber-700">
                  {Math.round(brewProgress)}% complete
                </p>
              </div>
            )}

            {!isBrewing && (
              <div className="text-center space-y-4">
                <p className="text-amber-900 font-semibold">Select Volume</p>
                <div className="grid grid-cols-3 gap-3">
                  {[200, 400, 600].map((vol) => (
                    <button
                      key={vol}
                      onClick={() => setVolume(vol)}
                      className={`py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                        volume === vol
                          ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg"
                          : "bg-amber-200 text-amber-900 hover:bg-amber-300"
                      }`}
                    >
                      {vol}mL
                    </button>
                  ))}
                </div>
                <p className="text-xs text-amber-700">
                  {volume === 200
                    ? `☕ Short brew ~${Math.floor(
                        config.brew200Duration / 60
                      )}:${String(config.brew200Duration % 60).padStart(
                        2,
                        "0"
                      )}`
                    : volume === 400
                    ? `☕☕ Medium brew ~${Math.floor(
                        config.brew400Duration / 60
                      )}:${String(config.brew400Duration % 60).padStart(
                        2,
                        "0"
                      )}`
                    : `☕☕☕ Large brew ~${Math.floor(
                        config.brew600Duration / 60
                      )}:${String(config.brew600Duration % 60).padStart(
                        2,
                        "0"
                      )}`}
                </p>
              </div>
            )}

            {/* Relay Status */}
            <div className="flex items-center justify-center gap-2 p-3 bg-amber-100 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full ${
                  relayState !== "ON" ? "bg-green-600" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm text-amber-900 font-medium">
                Relay:{" "}
                <span
                  className={
                    relayState !== "ON"
                      ? "text-green-700 font-bold"
                      : "text-gray-600"
                  }
                >
                  {relayState !== "ON" ? "ON" : "OFF"}
                </span>
              </span>
            </div>

            {/* Action Button */}
            <button
              onClick={isBrewing ? stopBrew : startBrew}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                isBrewing
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-amber-700 hover:to-yellow-700"
              } ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : isBrewing ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Brewing
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Brewing
                </>
              )}
            </button>

            {/* Emergency Deactivate Button */}
            {isBrewing && (
              <button
                onClick={activateRelay}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <AlertCircle className="w-5 h-5" />
                Emergency Stop
              </button>
            )}

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                  message.includes("Error")
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setPage("config")}
              className="w-full py-3 rounded-xl font-semibold bg-amber-200 text-amber-900 hover:bg-amber-300 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Configuration
            </button>
          </div>

          {/* Footer */}
          <div className="bg-amber-100 px-8 py-4 text-center text-xs text-amber-800 border-t border-amber-200">
            ☕ Handcrafted with ❤️ for coffee lovers
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pour {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}