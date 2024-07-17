# Webcam Capture Service

![Webcam Capture](webcam_capture.png)

This Node.js service captures photos using a webcam and detects if a live person is present.

## Features

- **Live Person Detection:** Uses computer vision to detect if a live person is in front of the webcam.
- **Automatic Photo Capture:** Once a live person is detected, the service prompts to stay still and captures a photo automatically.
- **Countdown Timer:** Shows a countdown timer before capturing a photo to allow the person to prepare.
- **Simple Integration:** Can be easily integrated into websites using an iframe and communicates via socket.io.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd webcam-capture-service
   
2. Install dependencies:
    ```bash
   npm install
