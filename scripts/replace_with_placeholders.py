import json
import sys
from bs4 import BeautifulSoup
import re

# Read input data
input_data = sys.stdin.read()
data = json.loads(input_data)

# Get HTML content from the input data
html_content = data.get("text", "")

# Parse HTML content
soup = BeautifulSoup(html_content, 'html.parser')

# Placeholder dictionary to store original tags and placeholders
placeholder_dict = {}

# Replace HTML tags with replaceable tags and store the original tags
for tag in soup.find_all():
    tag_str = str(tag)
    placeholder = f"tag{len(placeholder_dict) + 1}"
    
    # Generate the opening tag with attributes correctly
    attributes = []
    for key, value in tag.attrs.items():
        if isinstance(value, list):
            value = ' '.join(value)
        attributes.append(f'{key}="{value}"')
    attributes_str = ' '.join(attributes)
    original_tag = f"{tag.name} {attributes_str}".strip()  # Strip to remove trailing spaces if no attributes

    placeholder_dict[placeholder] = {"tag": tag.name, "tag_str": tag_str, "original_tag": original_tag}
    tag.name = placeholder

# Remove all attributes from the replaceable tags (placeholders)
for tag in soup.find_all():
    tag.attrs = {}

# Convert the modified HTML content back to string
modified_html_content = str(soup)

# Prepare object with original HTML tags and placeholders
html_object = {
    "contentId": data.get("contentId", ""),
    "fieldName": data.get("fieldName", ""),
    "element": [
        {
            "placeholder": key,
            "original_tag": value["original_tag"],
            "original_content": value["tag_str"]
        } for key, value in placeholder_dict.items()
    ],
}

output = {
    "modified_html_content": modified_html_content,
    "html_object": html_object,
    "html_content": {"received": html_content}
}

print(json.dumps(output))
