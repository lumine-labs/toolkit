type EventHandler<T> = (payload: T) => void

export class EventBus<Events extends Record<PropertyKey, unknown> = Record<PropertyKey, any>> {
    private listeners = new Map<keyof Events, Set<EventHandler<any>>>()

    on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
        let handlers = this.listeners.get(event)

        if (!handlers) {
            handlers = new Set()
            this.listeners.set(event, handlers)
        }

        handlers.add(handler)
        return () => this.off(event, handler)
    }

    once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
        const wrapper: EventHandler<Events[K]> = (payload) => {
            // unsubscribe before invoking, so a throwing or re-emitting handler
            // still runs at most once
            this.off(event, wrapper)
            handler(payload)
        }

        return this.on(event, wrapper)
    }

    off<K extends keyof Events>(event: K, handler?: EventHandler<Events[K]>) {
        const handlers = this.listeners.get(event)
        if (!handlers) return

        if (handler) {
            handlers.delete(handler)
        } else {
            handlers.clear()
        }

        if (handlers.size === 0) {
            this.listeners.delete(event)
        }
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]) {
        // snapshot: handlers subscribed while this emit runs must not receive it
        const handlers = this.listeners.get(event)
        if (!handlers) return

        Array.from(handlers).forEach((handler) => handler(payload))
    }
}
