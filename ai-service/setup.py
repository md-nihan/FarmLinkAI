from setuptools import setup, find_packages

setup(
    name="farmlink-ai-service",
    version="1.0.0",
    description="AI Quality Grading Service for FarmLink AI Platform",
    author="FarmLink AI Team",
    packages=find_packages(),
    install_requires=[
        "flask>=2.3.2",
        "Pillow>=12.0.0",
        "requests>=2.31.0",
        "python-dotenv>=1.0.0",
        "numpy>=1.24.3",
        "gunicorn>=21.2.0"
    ],
    python_requires=">=3.8",
)