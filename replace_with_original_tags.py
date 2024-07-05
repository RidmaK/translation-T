import json
import sys
from bs4 import BeautifulSoup

def replace_placeholders(html_content, elements):
   
    # Parse the HTML content
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Dictionary to map placeholders to their original tags
    placeholder_map = {element['placeholder']: element['original_tag'] for element in elements}
    
    # Replace placeholders with the corresponding original tags
    for placeholder, original_tag in placeholder_map.items():
        for tag in soup.find_all(placeholder):
            # Split the original tag to separate tag name and attributes
            tag_name, *tag_attributes = original_tag.split(' ', 1)
            # Create the new tag with the original tag name and attributes
            new_tag = soup.new_tag(tag_name)
            if tag_attributes:
                # Parse and add attributes to the new tag
                attr_soup = BeautifulSoup(f'<{original_tag}></{tag_name}>', 'html.parser')
                for attr, value in attr_soup.find(tag_name).attrs.items():
                    new_tag[attr] = value
            # Copy the contents of the old tag to the new tag
            for child in tag.contents:
                new_tag.append(child)
            # Replace the old tag with the new tag
            tag.replace_with(new_tag)

    # Return the modified HTML as a string
    return str(soup)

def main():
    # Read input data
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    # Get HTML content and elements from the input data
    html_content = data.get("html_content", "")
    elements = data.get("elements", [])

    # Replace placeholders in the HTML content
    modified_html = replace_placeholders(html_content, elements)

    # Prepare the output dictionary
    output = {
        "modified_html_content": modified_html,
        "original_html_content": html_content,
        "elements": elements
    }

    # Print the output as a JSON string
    print(json.dumps(output))

if __name__ == "__main__":
    main()
