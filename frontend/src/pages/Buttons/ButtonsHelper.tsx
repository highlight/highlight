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
    throw new Error('errors page');
};

export const RandomError = () => {
    RandomErrorDeeper();
};

const RandomErrorDeeper = () => {
    throw new Error(`random error! ${Math.random()}`);
};

export const NestedError = (message: string) => {
    console.error({
        message,
        cause: new Error('uh oh!'),
        title: 'same title',
    });
};
