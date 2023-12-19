# Canceling requests

The generated clients support canceling of requests, this works by canceling the promise that
is returned from the request. Each method inside a service (operation) returns a `CancelablePromise`
object. This promise can be canceled by calling the `cancel()` method. This method takes an optional `reason` parameter
which can help e.g. differentiate timeouts from repeated request aborts. The promise will then be rejected with this
reason. 

Below is an example of canceling the request after a certain timeout:

```typescript
import { UserService } from './myClient';

const getAllUsers = async () => {

    const request = UserService.getAllUsers();

    setTimeout(() => {
        if (!request.isResolved() && !request.isRejected()) {
            console.warn('Canceling request due to timeout');
            request.cancel();

            // Or providing your custom error:
            // request.cancel(new MyTimeoutError());
        }
    }, 1000);

    await request;
};
```

The API of the `CancelablePromise` is similar to a regular `Promise`, but it adds the
`cancel()` method and some additional properties:

```typescript
interface CancelablePromise<TResult> extends Promise<TResult> {
    readonly isResolved: boolean;
    readonly isRejected: boolean;
    readonly isCancelled: boolean;
    cancel: (reason?: any) => void;
}
```

- `isResolved`: Indicates if the promise was resolved.
- `isRejected`: Indicates if the promise was rejected.
- `isCancelled`: Indicates if the promise was canceled.
- `cancel()`: Cancels the promise (and request) and throws either the specified reason or a general error:
  `Request aborted`.
