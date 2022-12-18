namespace App {
    export function AutoBind(_:any, _2:string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        const adjDescriptor = {
            enumerable: false,
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }
        };
        return adjDescriptor
    }
}