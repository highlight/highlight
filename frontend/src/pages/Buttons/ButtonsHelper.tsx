import { H } from 'highlight.run';

export const CustomError = () => {
    CustomErrorDeeper();
};

const CustomErrorDeeper = () => {
    H.error('error is being thrown yo!');
};

export const DefaultError = () => {
    DefaultErrorDeeper();
};

const DefaultErrorDeeper = () => {
    H.error('error is being thrown yo!');
};
