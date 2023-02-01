import abc


class Integration(abc.ABC):
    def enable(self):
        raise NotImplementedError

    def disable(self):
        raise NotImplementedError
