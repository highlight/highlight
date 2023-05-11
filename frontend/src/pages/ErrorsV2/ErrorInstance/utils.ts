import { ErrorObjectFragment } from "@/graph/generated/operations"

export const isSessionAvailable = (errorObject?: ErrorObjectFragment) => {
    return errorObject && errorObject.session?.excluded === false

}