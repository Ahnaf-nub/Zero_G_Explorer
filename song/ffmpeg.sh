#!/bin/bash

# Create a bin directory if it doesn't exist
mkdir -p bin

# Download the FFmpeg binary
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar -xJ --strip-components=1 -C bin
