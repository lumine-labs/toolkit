import luminelabs from "@luminelabs/eslint-config/typescript"

export default [
    {
        // `_todo` is parked staging code, not part of any package build.
        ignores: ["**/dist/**", "**/coverage/**", "packages/_todo/**"],
    },
    ...luminelabs,
]
