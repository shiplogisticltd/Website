import os
import re
from PIL import Image

# Directories
root_dir = "/Users/0xshashank/Documents/marg-logistics"
images_dir = os.path.join(root_dir, "assets", "images")

# Code files to update references
code_files = [
    os.path.join(root_dir, "index.html"),
    os.path.join(root_dir, "about.html"),
    os.path.join(root_dir, "services.html"),
    os.path.join(root_dir, "fleet.html"),
    os.path.join(root_dir, "contact.html"),
    os.path.join(root_dir, "content.json")
]

# Excluded files (logos/favicons that should remain standard format)
excluded_basenames = [
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "favicon.ico"
]

converted_map = {} # Maps old filename to new webp filename

print("Starting image conversion to WebP...")

# 1. Convert images
for dirpath, _, filenames in os.walk(images_dir):
    for filename in filenames:
        ext = os.path.splitext(filename)[1].lower()
        if ext in [".jpg", ".jpeg", ".png"]:
            if filename in excluded_basenames:
                print(f"Skipping excluded favicon/app-icon: {filename}")
                continue
                
            old_path = os.path.join(dirpath, filename)
            new_filename = os.path.splitext(filename)[0] + ".webp"
            new_path = os.path.join(dirpath, new_filename)
            
            try:
                # Open image
                with Image.open(old_path) as img:
                    # Save as WebP with 75% quality compression
                    img.save(new_path, "WEBP", quality=75)
                
                # Verify size difference
                old_size = os.path.getsize(old_path)
                new_size = os.path.getsize(new_path)
                reduction = (old_size - new_size) / old_size * 100
                print(f"Converted: {filename} -> {new_filename} (Reduced size: {old_size//1024}KB -> {new_size//1024}KB, -{reduction:.1f}%)")
                
                # Delete original
                os.remove(old_path)
                
                # Track for codebase replacement (relative path keying)
                rel_old_path = os.path.relpath(old_path, root_dir)
                rel_new_path = os.path.relpath(new_path, root_dir)
                converted_map[rel_old_path] = rel_new_path
                
            except Exception as e:
                print(f"Failed to convert {filename}: {e}")

print("\nUpdating image references in HTML and JSON codebase...")

# 2. Update references in code files
for filepath in code_files:
    if os.path.exists(filepath):
        try:
            with open(filepath, "r") as f:
                content = f.read()
            
            updated_content = content
            replacements_made = 0
            
            for old_rel, new_rel in converted_map.items():
                # Replace absolute/relative variants in markup
                # E.g. "assets/images/about-story.jpg" -> "assets/images/about-story.webp"
                old_str = old_rel.replace("\\", "/")
                new_str = new_rel.replace("\\", "/")
                
                # Check for direct occurrences
                if old_str in updated_content:
                    updated_content = updated_content.replace(old_str, new_str)
                    replacements_made += 1
            
            if replacements_made > 0:
                with open(filepath, "w") as f:
                    f.write(updated_content)
                print(f"Updated {replacements_made} reference(s) in {os.path.basename(filepath)}")
            else:
                print(f"No references needed updating in {os.path.basename(filepath)}")
                
        except Exception as e:
            print(f"Error processing {os.path.basename(filepath)}: {e}")

print("\nConversion and references update complete!")
