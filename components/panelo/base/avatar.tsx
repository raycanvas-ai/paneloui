'use client'

import { Avatar as BaseAvatar } from '@base-ui/react/avatar'

function Avatar(props: BaseAvatar.Root.Props) {
    return <BaseAvatar.Root data-slot="avatar" {...props} />
}

function AvatarImage(props: BaseAvatar.Image.Props) {
    return <BaseAvatar.Image data-slot="avatar-image" {...props} />
}

function AvatarFallback(props: BaseAvatar.Fallback.Props) {
    return <BaseAvatar.Fallback data-slot="avatar-fallback" {...props} />
}

export { Avatar, AvatarFallback, AvatarImage }
