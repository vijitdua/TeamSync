import { createContext, useCallback, useContext, useEffect, useState } from "react";

const DialogContext = createContext();

/**
 * useDialog - Custom hook to access the global dialog functions.
 *
 * Provides access to the `createDialog`, `replaceAndEnqueueDialog`, and `closeCurrentlyVisibleDialog` functions,
 * which can be used to trigger, replace, or close a dialog from any part of the app.
 *
 * @returns {Object} - An object containing:
 *   - `createDialog`: Function to add a dialog to the queue.
 *   - `replaceAndEnqueueDialog`: Function to replace the current dialog with a new one and push every dialog back by 1 position.
 *   - `closeCurrentlyVisibleDialog`: Function to close the current dialog.
 *
 * Example usage:
 * ```jsx
 * import { useDialog } from './DialogProvider';
 *
 * const { createDialog, replaceAndEnqueueDialog, closeCurrentlyVisibleDialog } = useDialog();
 *
 * // Trigger a dialog
 * createDialog(YourDialogComponent);
 *
 * // Replace and enqueue a dialog
 * replaceAndEnqueueDialog(NewDialogComponent);
 *
 * // Close the currently visible dialog
 * closeCurrentlyVisibleDialog();
 * ```
 */
export function useDialog() {
    return useContext(DialogContext);
}

/**
 * DialogProvider - Global provider for managing dialogs.
 *
 * This provider manages a queue of dialogs and provides functions to display
 * dialogs globally from anywhere in the app. Dialogs are displayed one at a time,
 * in a First In, First Out (FIFO) order, and the next dialog is shown after the
 * current one is closed.
 *
 * Example usage:
 * In your root component, wrap your application with the `DialogProvider`:
 *
 * ```jsx
 * import { DialogProvider } from './DialogProvider';
 *
 * function App() {
 *   return (
 *     <DialogProvider>
 *       <YourMainComponent />
 *     </DialogProvider>
 *   );
 * }
 * ```
 *
 * Once wrapped, you can use the `useDialog` hook in any component to trigger,
 * replace or close dialogs.
 *
 * @param {React.ReactNode} children - The children components to render inside the provider.
 * @returns {React.JSX.Element} - The provider that enables dialog functionality.
 */
export function DialogProvider({ children }) {
    const [dialogQueue, setDialogQueue] = useState([]);
    const [currentlyVisibleDialog, setCurrentlyVisibleDialog] = useState(null);

    /**
     * Enqueues a dialog to be displayed.
     *
     * @param {React.Component} DialogComponent - The dialog component to render.
     */
    const enqueueDialog = useCallback((DialogComponent) => {
        setDialogQueue((prevQueue) => [...prevQueue, { Component: DialogComponent }]);
    }, []);

    /**
     * Replaces the current dialog and pushes the previous dialog to front of the queue after new dialog.
     *
     * @param {React.Component} DialogComponent - The new dialog component to replace the current one.
     */
    const replaceAndEnqueueDialog = useCallback((DialogComponent) => {
        setDialogQueue((prevQueue) => [{ Component: DialogComponent }, ...prevQueue]);
        closeCurrentlyVisibleDialog(); // Close current dialog to immediately show the new one
    }, []);

    /**
     * Closes the currently visible dialog and clears it from the screen.
     */
    const closeCurrentlyVisibleDialog = useCallback(() => {
        setCurrentlyVisibleDialog(null);
    }, []);

    /**
     * Processes the next dialog in the queue, setting it as the current dialog to display.
     */
    const processQueue = useCallback(() => {
        if (dialogQueue.length > 0) {
            setCurrentlyVisibleDialog(dialogQueue[0]);
            setDialogQueue((prevQueue) => prevQueue.slice(1));
        }
    }, [dialogQueue]);

    /**
     * Automatically processes the next dialog in the queue after the current one is closed.
     */
    useEffect(() => {
        if (dialogQueue.length > 0 && !currentlyVisibleDialog) {
            processQueue();
        }
    }, [dialogQueue, currentlyVisibleDialog, processQueue]);

    return (
        <DialogContext.Provider value={{ enqueueDialog, replaceAndEnqueueDialog, closeCurrentlyVisibleDialog }}>
            {children}
            {currentlyVisibleDialog && (
                <currentlyVisibleDialog.Component onClose={closeCurrentlyVisibleDialog} />
            )}
        </DialogContext.Provider>
    );
}