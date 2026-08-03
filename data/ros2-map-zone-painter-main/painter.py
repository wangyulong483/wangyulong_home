import cv2
import numpy as np
import argparse
import math

# ---------- Arguments ----------
parser = argparse.ArgumentParser()
parser.add_argument("--in", dest="in_path", default="my_map.pgm", help="Input PGM path")
parser.add_argument("--out_keep", dest="out_keep", default="keepout_mask.pgm", help="Keepout output (black)")
parser.add_argument("--out_speed", dest="out_speed", default="speed_mask.pgm", help="Speed filter output (gray)")
args = parser.parse_args()

# ---------- Settings ----------
COLOR_KEEP = 0
COLOR_SPEED = 128
color_val = COLOR_KEEP   # default: black

# ---------- Load image ----------
img = cv2.imread(args.in_path, cv2.IMREAD_GRAYSCALE)
if img is None:
    raise SystemExit(f"Input not found: {args.in_path}")
base = img.copy()   # background won't change

# separate masks
mask_keep = np.zeros_like(img, dtype=np.uint8)
mask_speed = np.zeros_like(img, dtype=np.uint8)

# ---------- Interaction state ----------
points = []                 # polygon points (image coordinates)
scale = 1.0                 # zoom
offset_x, offset_y = 0.0, 0.0   # pan offsets (screen pixels)
dragging = False            # right click pan
dragging_point = False      # left click point drag
selected_point_idx = -1     # selected point index
last_x, last_y = 0, 0
CANVAS_W, CANVAS_H = 900, 900  # display window size
POINT_SELECT_RADIUS = 8     # point selection radius (screen pixels)

# ---------- Brush mode ----------
brush_mode = False          # brush mode on/off
brush_size = 5              # brush size (pixels)
brush_painting = False      # currently painting with brush
brush_erasing = False       # currently erasing with brush

# ---------- Coordinate helpers ----------
def screen_to_world(sx, sy):
    x = (sx - offset_x) / scale
    y = (sy - offset_y) / scale
    return int(round(x)), int(round(y))

def world_to_screen(px, py):
    sx = int(round(px * scale + offset_x))
    sy = int(round(py * scale + offset_y))
    return sx, sy

def clamp_offset():
    global offset_x, offset_y
    max_off_x = CANVAS_W
    max_off_y = CANVAS_H
    min_off_x = -img.shape[1] * scale
    min_off_y = -img.shape[0] * scale
    offset_x = max(min_off_x, min(max_off_x, offset_x))
    offset_y = max(min_off_y, min(max_off_y, offset_y))

def zoom_at_screen(x, y, new_scale):
    global scale, offset_x, offset_y
    new_scale = max(0.2, min(8.0, new_scale))
    if new_scale == scale:
        return
    wx = (x - offset_x) / scale
    wy = (y - offset_y) / scale
    scale = new_scale
    offset_x = x - wx * scale
    offset_y = y - wy * scale
    clamp_offset()

def distance(p1, p2):
    """Calculate distance between two points"""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def find_nearest_point(screen_x, screen_y):
    """Find the nearest polygon point"""
    min_dist = float('inf')
    nearest_idx = -1

    for i, point in enumerate(points):
        # Convert world coordinate to screen coordinate
        sx, sy = world_to_screen(point[0], point[1])
        dist = distance((screen_x, screen_y), (sx, sy))

        if dist < POINT_SELECT_RADIUS and dist < min_dist:
            min_dist = dist
            nearest_idx = i

    return nearest_idx

# ---------- Drawing (overlay) ----------
def make_preview():
    preview = base.copy()

    # Draw speed mask first (gray)
    preview[mask_speed == 255] = COLOR_SPEED
    # Then draw keepout mask (black, takes priority over speed)
    preview[mask_keep == 255] = COLOR_KEEP

    # Draw polygon points only in polygon mode
    if not brush_mode:
        # Draw polygon points and edges
        for i, p in enumerate(points):
            # Selected point in different color
            color = 100 if i == selected_point_idx else 200
            radius = 3 if i == selected_point_idx else 2
            cv2.circle(preview, p, radius, color, -1)

            # Draw edges
            if i > 0:
                cv2.line(preview, points[i-1], points[i], 200, 1)

        # Closing edge between last and first point
        if len(points) > 2:
            cv2.line(preview, points[-1], points[0], 150, 1)

    return preview

# ---------- Trackbar ----------
def on_trackbar(val):
    z = max(20, val) / 100.0
    cx, cy = CANVAS_W // 2, CANVAS_H // 2
    zoom_at_screen(cx, cy, z)

# ---------- Mouse callback ----------
def mouse_cb(event, x, y, flags, param):
    global dragging, dragging_point, last_x, last_y, offset_x, offset_y, points, selected_point_idx, brush_painting, brush_erasing

    if brush_mode:
        # Brush mode - painting operations
        if event == cv2.EVENT_LBUTTONDOWN:
            brush_painting = True
            last_x, last_y = x, y  # Save last position
            # First brush stroke
            wx, wy = screen_to_world(x, y)
            if 0 <= wx < img.shape[1] and 0 <= wy < img.shape[0]:
                if color_val == COLOR_KEEP:
                    cv2.circle(mask_keep, (wx, wy), brush_size, 255, -1)
                else:
                    cv2.circle(mask_speed, (wx, wy), brush_size, 255, -1)
        elif event == cv2.EVENT_LBUTTONUP:
            brush_painting = False
        elif event == cv2.EVENT_MOUSEMOVE and brush_painting:
            # Paint only if mouse moved
            if x != last_x or y != last_y:
                wx, wy = screen_to_world(x, y)
                if 0 <= wx < img.shape[1] and 0 <= wy < img.shape[0]:
                    if color_val == COLOR_KEEP:
                        cv2.circle(mask_keep, (wx, wy), brush_size, 255, -1)
                    else:
                        cv2.circle(mask_speed, (wx, wy), brush_size, 255, -1)
                last_x, last_y = x, y  # Update position
        elif event == cv2.EVENT_RBUTTONDOWN:
            # Right click eraser
            brush_erasing = True
            last_x, last_y = x, y  # Save last position
            wx, wy = screen_to_world(x, y)
            if 0 <= wx < img.shape[1] and 0 <= wy < img.shape[0]:
                if color_val == COLOR_KEEP:
                    cv2.circle(mask_keep, (wx, wy), brush_size, 0, -1)
                else:
                    cv2.circle(mask_speed, (wx, wy), brush_size, 0, -1)
        elif event == cv2.EVENT_RBUTTONUP:
            brush_erasing = False
        elif event == cv2.EVENT_MOUSEMOVE and brush_erasing:
            # Right click + drag eraser (only if moved)
            if x != last_x or y != last_y:
                wx, wy = screen_to_world(x, y)
                if 0 <= wx < img.shape[1] and 0 <= wy < img.shape[0]:
                    if color_val == COLOR_KEEP:
                        cv2.circle(mask_keep, (wx, wy), brush_size, 0, -1)
                    else:
                        cv2.circle(mask_speed, (wx, wy), brush_size, 0, -1)
                last_x, last_y = x, y  # Update position
    else:
        # Polygon mode - normal operations
        if event == cv2.EVENT_LBUTTONDOWN:
            # Check for nearby point first
            nearest_idx = find_nearest_point(x, y)

            if nearest_idx != -1:
                # Select existing point and start dragging
                selected_point_idx = nearest_idx
                dragging_point = True
                print(f"Point {nearest_idx} selected")
            else:
                # Add new point
                wx, wy = screen_to_world(x, y)
                if 0 <= wx < img.shape[1] and 0 <= wy < img.shape[0]:
                    points.append((wx, wy))
                    selected_point_idx = len(points) - 1
                    print(f"New point added: ({wx}, {wy})")

        elif event == cv2.EVENT_LBUTTONUP:
            if dragging_point:
                dragging_point = False
                print(f"Point {selected_point_idx} moved")

        elif event == cv2.EVENT_RBUTTONDOWN:
            dragging = True
            last_x, last_y = x, y
            selected_point_idx = -1  # Deselect on right click

        elif event == cv2.EVENT_RBUTTONUP:
            dragging = False

        elif event == cv2.EVENT_MOUSEMOVE:
            if dragging_point and selected_point_idx != -1:
                # Move selected point
                wx, wy = screen_to_world(x, y)
                if 0 <= wx < img.shape[1] and 0 <= wy < img.shape[0]:
                    points[selected_point_idx] = (wx, wy)
            elif dragging:
                # Pan
                dx, dy = x - last_x, y - last_y
                offset_x += dx
                offset_y += dy
                last_x, last_y = x, y
                clamp_offset()

    # Zoom (works in both modes)
    if event == cv2.EVENT_MOUSEWHEEL:
        step = 1.25 if flags > 0 else 1/1.25
        zoom_at_screen(x, y, scale * step)

# ---------- Window ----------
cv2.namedWindow("Map", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Map", CANVAS_W, CANVAS_H)
cv2.setMouseCallback("Map", mouse_cb)
cv2.createTrackbar("Zoom x100%", "Map", int(scale * 100), 800, on_trackbar)
cv2.createTrackbar("Brush Size", "Map", brush_size, 50, lambda val: globals().update(brush_size=max(1, val)))

print("Left click: add/select/move point | ENTER: fill | k: black | g: gray | u: undo")
print("b: brush mode | +/-: zoom | Right click + drag: pan | c: clear")
print("Brush mode: Left click=paint | Right click=erase | Trackbar: zoom and brush size")
print("r: reset | s: save (two files) | ESC: exit")

# ---------- Main loop ----------
while True:
    preview = make_preview()
    scaled = cv2.resize(preview, None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST)
    canvas = np.full((CANVAS_H, CANVAS_W), 255, np.uint8)
    h, w = scaled.shape[:2]
    y1 = max(0, int(offset_y))
    x1 = max(0, int(offset_x))
    y2 = min(CANVAS_H, int(offset_y) + h)
    x2 = min(CANVAS_W, int(offset_x) + w)
    sy1 = max(0, -int(offset_y))
    sx1 = max(0, -int(offset_x))
    sy2 = sy1 + (y2 - y1)
    sx2 = sx1 + (x2 - x1)
    if x1 < CANVAS_W and y1 < CANVAS_H and x2 > 0 and y2 > 0:
        canvas[y1:y2, x1:x2] = scaled[sy1:sy2, sx1:sx2]

    # Status info
    mode_text = "BRUSH" if brush_mode else "POLYGON"
    status_text = f"Zoom: {scale:.2f}x  Mode: {mode_text}  Color: {'KEEP' if color_val==0 else 'SPEED'}"
    if brush_mode:
        status_text += f"  Brush: {brush_size}px"
    elif selected_point_idx != -1:
        status_text += f"  Selected: {selected_point_idx}"
    cv2.putText(canvas, status_text, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, 70, 1, cv2.LINE_AA)

    cv2.imshow("Map", canvas)
    key = cv2.waitKey(10) & 0xFF

    if key == 27:  # ESC
        break
    elif key == 13:  # ENTER: fill polygon
        if len(points) > 2:
            pts = np.array(points, np.int32).reshape((-1, 1, 2))
            if color_val == COLOR_KEEP:
                cv2.fillPoly(mask_keep, [pts], 255)
            else:
                cv2.fillPoly(mask_speed, [pts], 255)
            points = []
            selected_point_idx = -1
            print("Area filled.")
    elif key == ord('k'):
        color_val = COLOR_KEEP
        print("Keepout (black).")
    elif key == ord('g'):
        color_val = COLOR_SPEED
        print("Speed filter (gray).")
    elif key in (ord('u'), ord('U')):
        if points:
            if selected_point_idx == len(points) - 1:
                selected_point_idx = -1
            elif selected_point_idx > len(points) - 2:
                selected_point_idx = len(points) - 2
            points.pop()
            print("Last point removed")
    elif key in (ord('b'), ord('B')):  # Brush mode toggle
        brush_mode = not brush_mode
        brush_painting = False
        brush_erasing = False
        selected_point_idx = -1
        mode_text = "brush" if brush_mode else "polygon"
        print(f"Switched to {mode_text} mode")
    elif key in (ord('c'), ord('C')):  # Clear painted areas
        if brush_mode:
            # Clear entire mask in brush mode
            if color_val == COLOR_KEEP:
                mask_keep.fill(0)
                print("All keepout area cleared.")
            else:
                mask_speed.fill(0)
                print("All speed filter area cleared.")
        elif len(points) > 2:
            # Clear only polygon area in polygon mode
            pts = np.array(points, np.int32).reshape((-1, 1, 2))
            if color_val == COLOR_KEEP:
                cv2.fillPoly(mask_keep, [pts], 0)
                print("Keepout area cleared.")
            else:
                cv2.fillPoly(mask_speed, [pts], 0)
                print("Speed filter area cleared.")
            points = []
            selected_point_idx = -1
    elif key in (ord('r'), ord('R')):
        points = []
        selected_point_idx = -1
        print("Drawing reset.")
    elif key in (ord('+'), ord('='), ord(']'), ord('x'), ord('X')):
        cx, cy = CANVAS_W // 2, CANVAS_H // 2
        zoom_at_screen(cx, cy, scale * 1.25)
        cv2.setTrackbarPos("Zoom x100%", "Map", int(scale * 100))
    elif key in (ord('-'), ord('_'), ord('['), ord('z'), ord('Z')):
        cx, cy = CANVAS_W // 2, CANVAS_H // 2
        zoom_at_screen(cx, cy, scale / 1.25)
        cv2.setTrackbarPos("Zoom x100%", "Map", int(scale * 100))
    elif key in (ord('s'), ord('S')):
        # Debug: check mask state
        keepout_pixels = np.sum(mask_keep == 255)
        speed_pixels = np.sum(mask_speed == 255)
        overlap_count = np.sum((mask_keep == 255) & (mask_speed == 255))
        print(f"Debug: {keepout_pixels} keepout, {speed_pixels} speed, {overlap_count} overlapping")

        # keepout file - original map + all keepout areas (priority)
        out_keep = base.copy()
        out_keep[mask_keep == 255] = COLOR_KEEP

        print(f"Writing {keepout_pixels} keepout pixels to keepout file")
        cv2.imwrite(args.out_keep, out_keep)
        print(f"Keepout saved: {args.out_keep}")

        # speed file - original map + speed areas, all black pixels removed
        out_speed = base.copy()
        # Paint speed areas gray (excluding keepout)
        speed_only = (mask_speed == 255) & (mask_keep != 255)
        out_speed[speed_only] = COLOR_SPEED
        # Convert all black pixels to white (walls + keepout)
        out_speed[out_speed == 0] = 255

        pure_speed_count = np.sum(speed_only)
        print(f"Writing {pure_speed_count} pure speed pixels to speed file")
        cv2.imwrite(args.out_speed, out_speed)
        print(f"Speed filter saved: {args.out_speed}")

        if overlap_count > 0:
            print(f"{overlap_count} overlapping pixels resolved with keepout priority")
            print("Original map walls preserved in both files")
        else:
            print("No overlap, original map + filter areas saved")
        break

cv2.destroyAllWindows()
