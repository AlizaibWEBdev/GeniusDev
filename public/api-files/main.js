

function displayHistory() {
    // Retrieve existing history from local storage
    const history = JSON.parse(localStorage.getItem('requestHistory')) || [];

    // Get the element where history will be displayed
    const sidenav = document.querySelector('.sidenav');

    // Clear previous history entries
    sidenav.innerHTML = `
<span class="sidenav-header">
        <h2>History</h2>
     
    </span>
`;

    // Iterate over each history entry and create HTML elements to display it
    history.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.classList.add("request-main-url-inf")

        entryElement.addEventListener("click", () => { laodhistoryintoview(entry.id) })
        entryElement.innerHTML = `
<span class="request-info">
    <span class="request-date">${formatDate(entry.timestamp)}</span>
    <span class="request-type ${entry.method}">${entry.method}</span>
</span>
<span class="request-url">
    ${entry.url}
</span>
`;

        sidenav.appendChild(entryElement);
    });
}
displayHistory()
// Helper function to format the date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
}

function updateHistory(requestData) {
    let history = JSON.parse(localStorage.getItem('requestHistory')) || [];

    history.unshift({
        method: requestData.method,
        url: requestData.url,
        queryParams: requestData.queryParams,
        headers: requestData.headers,
        body: requestData.body,
        timestamp: new Date().toISOString(),
        id: String(Math.random())
    });
    if (history.length > 15) {
        history = history.slice(0, 15);
    }
    localStorage.setItem('requestHistory', JSON.stringify(history));

    displayHistory();
}

document.getElementById('api-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const method = document.getElementById('method').value;
    const url = document.getElementById('url').value;
    const queryParams = getQueryParams();
    const headers = getHeaders();
    const body = document.getElementById('body-input').value;




    updateHistory({ method, url, queryParams, headers, body });



    let fullUrl = url;
    if (queryParams.length) {
        fullUrl += `?${queryParams.map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`).join('&')}`;
    }

    document.getElementById('loading-indicator').style.display = 'block';
    const startTime = performance.now();

    try {
        const response = await fetch(fullUrl, {
            method: method,
            headers: headers,
            body: method === 'GET' ? null : JSON.stringify(JSON.parse(body || '{}')),
        });

        const responseTime = (performance.now() - startTime).toFixed(2);
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        const dataSize = (new TextEncoder().encode(responseText).length / 1024).toFixed(2);

        document.getElementById('response-details').textContent = `Time: ${responseTime} ms | Size: ${dataSize} KB`;

        if (contentType && contentType.includes('application/json')) {
            document.getElementById('response-output').textContent = JSON.stringify(JSON.parse(responseText), null, 2);
        } else {
            document.getElementById('response-output').textContent = responseText;
        }
    } catch (error) {
        document.getElementById('response-output').textContent = `Error: ${error.message}`;
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
    updateCodeSnippet()
});

document.getElementById('add-query-param').addEventListener('click', function () {
    addField('query-params-container');
});

document.getElementById('add-header').addEventListener('click', function () {
    addField('headers-container');
});

function addField(containerId) {
    const container = document.getElementById(containerId);
    const newField = container.firstElementChild.cloneNode(true);
    newField.querySelector('.field-key').value = '';
    newField.querySelector('.field-value').value = '';
    newField.querySelector('.remove-field').style.display = 'inline';
    container.appendChild(newField);

    newField.querySelector('.remove-field').addEventListener('click', function () {
        container.removeChild(newField);
    });
}

function getQueryParams() {
    return Array.from(document.querySelectorAll('#query-params-container .field-item'))
        .map(item => ({ key: item.querySelector('.field-key').value, value: item.querySelector('.field-value').value }))
        .filter(param => param.key);
}

function getHeaders() {
    const headers = {};
    Array.from(document.querySelectorAll('#headers-container .field-item'))
        .forEach(item => {
            const key = item.querySelector('.field-key').value;
            const value = item.querySelector('.field-value').value;
            if (key) {
                headers[key] = value;
            }
        });
    return headers;
}



// Function to generate code snippets
function generateCode(method, url, queryParams, headers, body) {
    // Handle query parameters
    const formattedParams = queryParams.map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`).join('&');
    const baseUrl = formattedParams ? `${url}?${formattedParams}` : url;

    // Generate code snippets
    const snippets = {
        python: `import requests\n\nresponse = requests.${method.toLowerCase()}('${baseUrl}', json=${body ? JSON.stringify(JSON.parse(body || '{}'), null, 2) : 'None'})\nprint(response.text)`,
        javascript: `fetch('${baseUrl}', {\n    method: '${method}',\n    headers: ${JSON.stringify(headers, null, 2)},\n    body: ${body ? JSON.stringify(JSON.parse(body || '{}'), null, 2) : 'null'}\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`,
        nodejs: `const fetch = require('node-fetch');\n\nfetch('${baseUrl}', {\n    method: '${method}',\n    headers: ${JSON.stringify(headers, null, 2)},\n    body: ${body ? JSON.stringify(JSON.parse(body || '{}'), null, 2) : 'null'}\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`,
        java: `import java.net.HttpURLConnection;\nimport java.net.URL;\nimport java.io.BufferedReader;\nimport java.io.InputStreamReader;\n\npublic class ApiRequest {\n    public static void main(String[] args) throws Exception {\n        URL url = new URL("${baseUrl}");\n        HttpURLConnection conn = (HttpURLConnection) url.openConnection();\n        conn.setRequestMethod("${method}");\n        conn.setRequestProperty("Content-Type", "application/json");\n        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));\n        String inputLine;\n        StringBuffer response = new StringBuffer();\n        while ((inputLine = in.readLine()) != null) {\n            response.append(inputLine);\n        }\n        in.close();\n        System.out.println(response.toString());\n    }\n}`,
        csharp: `using System;\nusing System.Net.Http;\nusing System.Threading.Tasks;\n\nclass Program\n{\n    static async Task Main()\n    {\n        using (var client = new HttpClient())\n        {\n            client.DefaultRequestHeaders.Add("Accept", "application/json");\n            var response = await client.${method.toLowerCase()}Async("${baseUrl}");\n            var content = await response.Content.ReadAsStringAsync();\n            Console.WriteLine(content);\n        }\n    }\n}`,
        php: `<?php\n\n$url = '${baseUrl}';\n$headers = [\n    // Add headers here\n];\n\n$options = [\n    'http' => [\n        'header'  => ${headers ? JSON.stringify(headers, null, 2) : '[]'},\n        'method'  => '${method}',\n        'content' => ${body ? `'${body}'` : 'null'}\n    ]\n];\n\n$context  = stream_context_create($options);\n$result = file_get_contents($url, false, $context);\n\nif ($result === FALSE) {\n    // Handle error\n}\n\nvar_dump($result);\n?>`,
        ruby: `require 'net/http'\nrequire 'json'\n\nuri = URI('${baseUrl}')\nrequest = Net::HTTP::${method}.new(uri)\nrequest['Content-Type'] = 'application/json'\n\nresponse = Net::HTTP.start(uri.hostname, uri.port) do |http|\n  http.request(request)\nend\n\nputs response.body`,
        go: `package main\n\nimport (\n    "bytes"\n    "fmt"\n    "io/ioutil"\n    "net/http"\n)\n\nfunc main() {\n    client := &http.Client{}\n    req, err := http.NewRequest("${method}", "${baseUrl}", bytes.NewBuffer([]byte(${body ? `'${body}'` : 'null'})))\n    if err != nil {\n        fmt.Println(err)\n        return\n    }\n    req.Header.Set("Content-Type", "application/json")\n    resp, err := client.Do(req)\n    if err != nil {\n        fmt.Println(err)\n        return\n    }\n    defer resp.Body.Close()\n    body, _ := ioutil.ReadAll(resp.Body)\n    fmt.Println(string(body))\n}`,
        swift: `import Foundation\n\nlet url = URL(string: "${baseUrl}")!\nvar request = URLRequest(url: url)\nrequest.httpMethod = "${method}"\nrequest.httpBody = ${body ? `'${body}'` : 'nil'}\n\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in\n    guard let data = data, error == nil else { return }\n    let responseString = String(data: data, encoding: .utf8)\n    print(responseString ?? "")\n}\ntask.resume()`,
        curl: `curl -X ${method} "${baseUrl}" -H "Content-Type: application/json" -d '${body ? `${body}` : ''}'`
    };

    return snippets;
}


// Function to update the code snippet display
function updateCodeSnippet() {
    const method = document.getElementById('method').value;
    const url = document.getElementById('url').value;
    const queryParams = getQueryParams();
    const headers = getHeaders();
    const body = document.getElementById('body-input').value;
    const language = document.getElementById('language').value;

    const codeSnippets = generateCode(method, url, queryParams, headers, body);
    document.getElementById('code-output').textContent = codeSnippets[language] || '';

}

// Initial code snippet update
updateCodeSnippet();

// Update code snippet when the language is changed
document.getElementById('language').addEventListener('change', updateCodeSnippet);



function copycode() {
    const responseOutput = document.getElementById("code-output");
    const copyBtn = document.getElementById("copy-btn-");

    navigator.clipboard.writeText(responseOutput.innerText)
        .then(() => {
            // Update button icon to indicate success
            copyBtn.classList.replace("fa-copy", "fa-check");

            // Revert button icon back after a short delay
            setTimeout(() => {
                copyBtn.classList.replace("fa-check", "fa-copy");
            }, 700);
        })
        .catch(err => {
            // Handle error if clipboard write fails
            console.error('Failed to copy text: ', err);
        });
}

function laodhistoryintoview(id) {
    const history = JSON.parse(localStorage.getItem('requestHistory'))
    const target = history.filter(e => e.id == id)
    var selectElement = document.getElementById("method");


    for (let index = 0; index < selectElement.options.length; index++) {
        const element = selectElement.options[index];
        if (element.value.toLowerCase() == target[0].method.toLowerCase()) {

            selectElement.options.selectedIndex = index

        }

    }


    document.getElementById("url").value = target[0].url;

    let queryContainer = document.getElementById("query-params-container");
    let querykeyvals = target[0].queryParams;

    queryContainer.innerHTML = "";

    if (querykeyvals.length > 0) {


        for (let index = 0; index < querykeyvals.length; index++) {
            const element = querykeyvals[index];

            queryContainer.innerHTML += `
        <div class="field-item">
            <input type="text" class="form-control field-key" placeholder="Param Key" value="${element.key}">
            <input type="text" class="form-control field-value" placeholder="Param Value" value="${element.value}">
                <button type="button" class="btn btn-danger remove-field" style="display:${index == 0 ? "none" : "flex"};">
                    <i class="fa-solid fa-trash" style="color: white;"></i>
                </button>
        </div>
        
        `;


        }
    } else {
        queryContainer.innerHTML += `
    <div class="field-item">
        <input type="text" class="form-control field-key" placeholder="Param Key" value="">
        <input type="text" class="form-control field-value" placeholder="Param Value" value="">
            <button type="button" class="btn btn-danger remove-field" style="display:none;">
                <i class="fa-solid fa-trash" style="color: white;"></i>
            </button>
    </div>
    
    `;

    }

    let headersContainer = document.getElementById("headers-container");

    let headerskeyvalue = target[0].headers;

    let i = 0;
    headersContainer.innerHTML = ``;


    if (Object.keys(headerskeyvalue).length > 0) {
        for (const key in headerskeyvalue) {
            if (Object.prototype.hasOwnProperty.call(headerskeyvalue, key)) {
                const value = headerskeyvalue[key];

                headersContainer.innerHTML = `
              <div class="field-item">
                                            <input type="text" class="form-control field-key" placeholder="Header Key" value="${key}">
                                            <input type="text" class="form-control field-value " placeholder="Header Value" value="${value}">
                                            <button type="button" class="btn btn-danger remove-field"
                                                style="display:${i == 0 ? "none" : "flex"};">
                                                <i class="fa-solid fa-trash" style="color: white;"></i>
                                            </button>
                                        </div>
            
            `


            }

            i++;
        }

    } else {
        headersContainer.innerHTML = `
    <div class="field-item">
                                  <input type="text" class="form-control field-key" placeholder="Header Key">
                                  <input type="text" class="form-control field-value " placeholder="Header Value">
                                  <button type="button" class="btn btn-danger remove-field"
                                      style="display: none;">
                                      <i class="fa-solid fa-trash" style="color: white;"></i>
                                  </button>
                              </div>
  
  `

    }
document.getElementById("body-input").value = target[0].body    
}
document.getElementById('body-input').addEventListener('keydown', function(event) {
    const textarea = this;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    if (event.key === '{') {
        event.preventDefault();
        textarea.value = value.slice(0, start) + '{}' + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    } else if (event.key === '[') {
        event.preventDefault();
        textarea.value = value.slice(0, start) + '[]' + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    } else if (event.key === '"') {
        event.preventDefault();
        textarea.value = value.slice(0, start) + '""' + value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
    }
});
