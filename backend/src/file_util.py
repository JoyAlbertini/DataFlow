from pathlib import Path
import random, string


def random_word(length: int) -> str:
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))


def get_data_folder() -> Path:
    return Path(__file__).parent.parent.joinpath('data')
