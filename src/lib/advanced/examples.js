/**
 * Example filter scripts for the custom JavaScript filter feature
 * These provide users with working examples to learn from and modify
 */

export const examples = [
  {
    title: "Skip Small Files",
    description: "Skip downloads smaller than 1MB",
    code: `function filter(download) {
  const minSize = 1024 * 1024; // 1MB
  return {
    skip: download.fileSize < minSize
  };
}`,
  },
  {
    title: "Organize by File Type",
    description: "Sort downloads into folders by file extension",
    code: `function filter(download) {
  const extension = download.filename.split('.').pop().toLowerCase();

  const folders = {
    'jpg': 'Images',
    'png': 'Images',
    'gif': 'Images',
    'mp4': 'Videos',
    'mkv': 'Videos',
    'avi': 'Videos',
    'pdf': 'Documents',
    'doc': 'Documents',
    'docx': 'Documents',
    'zip': 'Archives',
    'rar': 'Archives',
    '7z': 'Archives'
  };

  return {
    skip: false,
    dir: folders[extension] || 'Other'
  };
}`,
  },
  {
    title: "Skip Specific Domains",
    description: "Skip downloads from certain domains",
    code: `function filter(download) {
  const url = new URL(download.url);
  const blockedDomains = ['ads.example.com', 'tracker.site.com'];

  return {
    skip: blockedDomains.includes(url.hostname)
  };
}`,
  },
  {
    title: "Rename with Date",
    description: "Add current date to filename",
    code: `function filter(download) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const baseName = download.filename.split('.').slice(0, -1).join('.');
  const extension = download.filename.split('.').pop();

  return {
    skip: false,
    filename: \`\${baseName}_\${date}.\${extension}\`
  };
}`,
  },
];

/**
 * Sample test data used for validating filter scripts
 */
export const sampleTestData = {
	url: "https://example.com/test-file.pdf",
	filename: "test-document.pdf",
	fileSize: 2048576, // 2MB
	mime: "application/pdf",
	referrer: "https://example.com",
};
