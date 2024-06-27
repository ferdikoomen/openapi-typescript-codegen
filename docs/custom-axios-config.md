## Using a custom Axios config

Sometime you may want to use your own Axios config for requests.
`onUploadProgress` or `onDownloadProgress` are two examples of this.

```typescript
FileService.uploadFile({
    file,
}).axiosConfig({
    onUploadProgress: (event) => {
        // Do something with the event
        console.log(event.loaded / event.total)
    }
})
```
