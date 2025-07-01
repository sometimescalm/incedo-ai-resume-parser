from setuptools import setup, find_packages

setup(
    name='resume-processor',
    version='0.1.0',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'PyPDF2',  # For PDF processing
        'pandas',   # For CSV processing
    ],
    entry_points={
        'console_scripts': [
            'resume-processor=main:main',  # Assuming main.py has a main function
        ],
    },
    author='Your Name',
    author_email='your.email@example.com',
    description='A project to process resume files in PDF and CSV formats and output formatted resumes.',
    url='https://github.com/yourusername/resume-processor',  # Replace with your project URL
)