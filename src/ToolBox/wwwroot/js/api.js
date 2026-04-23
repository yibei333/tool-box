const API_BASE = '/api';

async function api(method, path, data = null) {
    const headers = {};
    const config = { method, headers };
    if (data) {
        headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_BASE}${path}`, config);
    const text = await response.text();
    let result;
    try { result = JSON.parse(text); }
    catch { throw new Error(`Invalid response: ${text.substring(0, 200)}`); }
    if (!result.success) throw new Error(result.message || 'Request failed');
    return result;
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
}

window.api = api;
window.copyToClipboard = copyToClipboard;
