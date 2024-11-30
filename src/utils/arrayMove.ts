export function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = array.slice(); // Create a shallow copy of the array
    const [removed] = newArray.splice(from, 1); // Remove the item from its old position
    newArray.splice(to, 0, removed); // Insert the item at its new position
    return newArray;
}

