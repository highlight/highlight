from highlight_io.utils.dict import flatten_dict


def test_flatten_dict():
    test_cases = [
        {
            "input": {
                "movie": {
                    "title": "Gladiator",
                    "year": 2000,
                    "rating": 8.5,
                    "actors": ["Russell Crowe", "Joaquin Pheonix"],
                },
                "show": {"title": "Psych", "favorite": True},
                "process": True,
            },
            "expected": {
                "movie.title": "Gladiator",
                "movie.year": 2000,
                "movie.rating": 8.5,
                "movie.actors": ["Russell Crowe", "Joaquin Pheonix"],
                "show.title": "Psych",
                "show.favorite": True,
                "process": True,
            },
        },
        {
            "input": {
                "movie": "Godfather",
                "favorite": False,
                "rating": 9,
                "actors": ["Marlon Brando", "Al Pacino", "James Caan"],
            },
            "expected": {
                "movie": "Godfather",
                "favorite": False,
                "rating": 9,
                "actors": ["Marlon Brando", "Al Pacino", "James Caan"],
            },
        },
    ]

    for test_case in test_cases:
        assert flatten_dict(test_case["input"]) == test_case["expected"]
