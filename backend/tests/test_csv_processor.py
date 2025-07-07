import unittest
from src.processors.csv_processor import CsvProcessor

class TestCsvProcessor(unittest.TestCase):

    def setUp(self):
        self.processor = CsvProcessor()

    def test_process_csv_valid(self):
        # Assuming we have a valid CSV file path for testing
        result = self.processor.process_csv('valid_resume.csv')
        self.assertIsInstance(result, dict)  # Check if the result is a dictionary
        self.assertIn('name', result)  # Check if 'name' key exists in the result

    def test_process_csv_invalid(self):
        # Test with an invalid CSV file path
        with self.assertRaises(FileNotFoundError):
            self.processor.process_csv('invalid_resume.csv')

if __name__ == '__main__':
    unittest.main()