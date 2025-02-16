#!/bin/bash

# Ask for version number and release notes
read -p "Enter version number: " version
read -p "Enter release notes: " release_notes

# Add all changes to git
git add .

# Commit changes with version number and release notes
git commit -m "v$version - $release_notes"

# Tag the commit with the version number (Create an annotated tag)
git tag -a "v$version" -m "$release_notes"

# Push changes to main branch
git push origin main

# Push the tag to the repository
git push origin "v$version"

# Push changes to version branch
git push origin "v$version"

echo "Release $version has been pushed to main and v$version branches."

# List of 10 tags
echo "here's a list of latest 10 tags:"
git tag --sort=-creatordate | head -n 10