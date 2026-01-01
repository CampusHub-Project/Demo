import os
import sys
from dotenv import load_dotenv


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

load_dotenv(".env.test", override=True)
