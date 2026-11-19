"""Report the frame-to-frame differences of the sample clip.

Diagnostic only: it prints how many frames the player's OpenCV detection would record at
several thresholds (stride 1), so a threshold can be picked for the capture run. The marks in
the captures come from the player's own detection script, not from this file.
"""
import sys

import cv2

capture = cv2.VideoCapture(sys.argv[1])
fps = capture.get(cv2.CAP_PROP_FPS)
total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
ok, frame = capture.read()
previous = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
differences = []
while True:
    ok, frame = capture.read()
    if not ok:
        break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    differences.append(float(cv2.absdiff(previous, gray).mean()))
    previous = gray

print(f"fps={fps:.3f} frames={total} read={len(differences) + 1} size={frame.shape if frame is not None else previous.shape}")
for threshold in (15, 20, 25, 30, 35, 40, 50, 60, 70):
    frames = [index for index, value in enumerate(differences) if value >= threshold]
    print(f"threshold {threshold}: {len(frames)} frames")
    print("  " + " ".join(f"{index}@{index / fps:.1f}s" for index in frames))
