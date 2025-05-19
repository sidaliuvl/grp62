export const isEnvBrowser = () => !window.invokeNative;

export const noop = () => {};

export async function fetchNui(eventName, data) {
    if (isEnvBrowser()) {
        console.log('NUI call in browser:', eventName, data);
        return true; // Return success for most operations in dev mode
    }

    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    };

    const resourceName = window.GetParentResourceName ? window.GetParentResourceName() : 'nui-frame-app';
    const resp = await fetch(`https://${resourceName}/${eventName}`, options);
    const respFormatted = await resp.json();
    return respFormatted;
}