☕ Smart Coffee Maker IoT Controller — User Manual
Version: 1.0
Powered by ESP32 + OLED Display

Developed with Next.js Dashboard (Frontend) & REST API (ESP32 Web Server)

🧩 1. Product Overview

The Smart Coffee Maker IoT Controller allows you to start, stop, and monitor coffee brewing remotely using WiFi.
Equipped with an OLED display and RGB LED indicator, it provides real-time brewing status, remaining time, and network information directly on the device.

⚙️ 2. Features

✅ WiFi-enabled brewing control (via REST API or Next.js dashboard)

✅ OLED screen showing:

Connection status

Brewing progress and remaining time

Device IP address

Relay state (ON/OFF)

✅ RGB LED indicator for system state:

🔴 Red = Idle / Stopped

🟢 Green = Brewing

⚫ Off = Standby

✅ Configurable brew durations (200mL, 400mL, 600mL)

✅ Remote start/stop brewing commands

✅ Built-in web API for integration with apps or home automation

🪛 3. Hardware Specifications
Component	Description
Microcontroller	ESP32 (WiFi-enabled)
Relay Output	5V Relay Module (Active LOW)
OLED Display	0.96” SSD1306 (128×64, I²C Address 0x3C)
RGB LED	Common Cathode (Pins 16, 17, 18)
Operating Voltage	3.3V–5V
Relay Pin	GPIO 5
WiFi	2.4 GHz (SSID and password configured in code)
Server Port	HTTP Port 80
⚡ 4. Pin Connections
Function	ESP32 Pin	Description
Relay	GPIO 5	Controls coffee maker power
LED Red	GPIO 16	Brewing Off / Error
LED Green	GPIO 17	Brewing On
LED Blue	GPIO 18	Reserved (future use)
OLED SDA	GPIO 21	I²C Data
OLED SCL	GPIO 22	I²C Clock
Power	3.3V	For OLED and relay
GND	GND	Common ground
🌐 5. Network Setup

Power on the device.

The OLED will display:

Smart Coffee Maker
Initializing...


The ESP32 will connect to your WiFi network using the credentials set in the code:

const char* ssid = "HUAWEI-rqXC";
const char* password = "wcJD2M5Q";


Once connected, the OLED will display your device IP address:

IP: 192.168.x.x
Status: Idle
Relay: OFF


💡 Use this IP to access the web API from your browser or Next.js dashboard.

☕ 6. Brewing Operation
▶️ Start Brewing

Send an HTTP POST request to /brew with a JSON body:

{
  "duration": 165000
}

Volume	Duration (ms)	Duration (minutes)
200 mL	165000	2.75 min
400 mL	330000	5.5 min
600 mL	495000	8.25 min

✅ Example using curl:

curl -X POST http://192.168.x.x/brew -H "Content-Type: application/json" -d '{"duration":165000}'


The OLED will show:

Status: Brewing...
Remaining: 165s


The LED will turn green, and the relay will activate.

⏹️ Stop Brewing

To stop brewing early, send:

curl -X POST http://192.168.x.x/stop


The relay turns off, LED turns red, and display updates to:

Status: Idle
Relay: OFF

🧠 7. REST API Reference
Endpoint	Method	Description
/	GET	Returns plain text “Smart Coffee Maker Online”
/status	GET	Returns current state in JSON
/brew	POST	Starts brewing with JSON body { "duration": <ms> }
/stop	POST	Stops brewing immediately
/relay/off	POST	Turns off relay manually
/config	GET	Returns current configuration (durations, pins)
/config	POST	Updates configuration (send JSON with new durations)

✅ Example /status response:

{
  "connected": true,
  "isBrewing": true,
  "relayState": "ON",
  "elapsedMs": 30000,
  "remainingMs": 135000,
  "totalDurationMs": 165000,
  "uptime": 102340,
  "ip": "192.168.1.12",
  "signal": -55
}

💡 8. LED Indicator Guide
LED Color	Meaning
🔴 Red	Idle / Brewing stopped
🟢 Green	Brewing in progress
⚫ Off	Standby / Initializing
🖥️ 9. OLED Display States
Display Text	Meaning
Smart Brew	System ready
Status: Brewing...	Brewing in progress
Remaining: XXs	Time left in seconds
IP: 192.168.x.x	Device IP
Relay: ON/OFF	Relay state
🔧 10. Troubleshooting
Problem	Possible Cause	Solution
Relay always ON	Relay is active LOW	Ensure digitalWrite(RELAY_PIN, HIGH); in setup
No OLED display	Incorrect I2C wiring or address	Check SDA (GPIO21), SCL (GPIO22), and I2C address (0x3C)
API not responding	WiFi not connected	Check SSID/password or router proximity
Brewing doesn’t start	Duration invalid or too long	Must be between 1 and 600000 ms (10 min)
🧾 11. Technical Summary
Parameter	Value
Power Input	5V DC
Control Logic	3.3V
Network	2.4GHz WiFi
Display	128×64 OLED SSD1306
Max Brew Time	10 minutes
API Port	80 (HTTP)
JSON Payload	UTF-8 encoded
Firmware	Arduino (ESP32 WiFi + WebServer + OLED)
📘 12. Safety and Usage Notes

Do not exceed 600mL (10 minutes) per brew.

Keep the ESP32 away from water or steam.

Use a properly rated relay for your coffee maker’s power rating.

Always disconnect power when modifying wiring.

Ensure good WiFi coverage for reliable operation.

🧑‍💻 13. Dashboard Integration

This firmware can be integrated with your Next.js dashboard using REST requests to display:

Real-time brew status

Remaining brew time

Start/stop controls

Configuration settings

Example frontend route:

fetch(`http://${deviceIP}/status`).then(res => res.json())