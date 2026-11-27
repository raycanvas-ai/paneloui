'use client'

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'

type CheckboxProps = Omit<BaseCheckbox.Root.Props, 'checked'> & {
    /** UI SDK folds indeterminate into `checked`; Base UI keeps it in its own `indeterminate` prop. */
    checked?: boolean | 'indeterminate'
}

// UI SDK's checkbox is a <button> (Base UI's default is a <span>), so `:disabled` styles and `htmlFor` keep working.
function Checkbox({ checked, indeterminate, render, nativeButton = !render, ...props }: CheckboxProps) {
    return (
        <BaseCheckbox.Root
            data-slot="checkbox"
            {...props}
            checked={checked === 'indeterminate' ? false : checked}
            indeterminate={indeterminate ?? checked === 'indeterminate'}
            nativeButton={nativeButton}
            render={render ?? <button />}
        />
    )
}

function CheckboxIndicator(props: BaseCheckbox.Indicator.Props) {
    return <BaseCheckbox.Indicator data-slot="checkbox-indicator" {...props} />
}

function CheckboxGroup(props: BaseCheckboxGroup.Props) {
    return <BaseCheckboxGroup data-slot="checkbox-group" {...props} />
}

export { Checkbox, CheckboxGroup, CheckboxIndicator }
