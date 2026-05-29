from PIL import Image
import sys

def make_transparent(file_path):
    try:
        img = Image.open(file_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] >= 235 and item[1] >= 235 and item[2] >= 235:
                # keep color, set alpha to 0
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(file_path, "PNG")
        print(f"Processed {file_path}")
    except Exception as e:
        print(f"Failed to process {file_path}: {e}")

if __name__ == "__main__":
    make_transparent("public/speednet.png")
    make_transparent("public/st1.png")
    make_transparent("public/mundonet.png")
    make_transparent("public/ixbr.png")
