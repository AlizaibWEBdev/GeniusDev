document.getElementById('minifyHtmlBtn').addEventListener('click', function() {
    const htmlInput = document.getElementById('htmlInput').value;
    const minifiedHtml = htmlInput
        .replace(/\n\s*/g, '') // Remove new lines and spaces
        .replace(/>\s*</g, '><'); // Remove spaces between tags
    document.getElementById('htmlOutput').value = minifiedHtml;
});

document.getElementById('minifyCssBtn').addEventListener('click', function() {
    const cssInput = document.getElementById('cssInput').value;
    const minifiedCss = cssInput
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around {
        .replace(/\s*}\s*/g, '}') // Remove spaces around }
        .replace(/\s*:\s*/g, ':') // Remove spaces around :
        .replace(/\s*;\s*/g, ';') // Remove spaces around ;
        .replace(/;\s*}/g, '}'); // Remove ; before }
    document.getElementById('cssOutput').value = minifiedCss;
});


document.getElementById('minifyJsBtn').addEventListener('click', function() {
    const jsInput = document.getElementById('jsInput').value;
    const minifiedJs = jsInput
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around {
        .replace(/\s*}\s*/g, '}') // Remove spaces around }
        .replace(/\s*:\s*/g, ':') // Remove spaces around :
        .replace(/\s*;\s*/g, ';') // Remove spaces around ;
        .replace(/;\s*}/g, '}')   // Remove ; before }
        .replace(/\/\*.*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*(?=[\n\r])/g, ''); // Remove line comments
    document.getElementById('jsOutput').value = minifiedJs;
});
