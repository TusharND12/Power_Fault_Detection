# Contributing to Power Fault Prediction System

Thank you for your interest in contributing to the Power Fault Prediction System! We welcome contributions from the community and appreciate your help in making this project better.

## 🤝 How to Contribute

### 1. Fork the Repository
- Click the "Fork" button on the GitHub repository page
- Clone your forked repository to your local machine:
```bash
git clone https://github.com/yourusername/power-fault-prediction.git
cd power-fault-prediction
```

### 2. Set Up Development Environment
```bash
# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/your-bugfix-name
```

### 4. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 5. Test Your Changes
```bash
# Run the application
python app.py

# Test the API endpoints
python test_precision.py
```

### 6. Commit Your Changes
```bash
git add .
git commit -m "Add: Brief description of your changes"
```

### 7. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Code Style Guidelines

### Python Code Style
- Follow PEP 8 style guide
- Use meaningful variable and function names
- Add docstrings for functions and classes
- Keep functions small and focused

### Frontend Code Style
- Use consistent indentation (2 spaces)
- Use meaningful CSS class names
- Comment complex JavaScript logic
- Follow responsive design principles

### Documentation
- Update README.md if adding new features
- Add inline comments for complex logic
- Update API documentation for new endpoints

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Clear Description**: Describe the problem clearly
2. **Steps to Reproduce**: Provide steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: 
   - Operating System
   - Python version
   - Browser (for frontend issues)
6. **Screenshots**: If applicable, include screenshots
7. **Logs**: Include any error logs or console output

## ✨ Feature Requests

When requesting features:

1. **Clear Description**: Describe the feature you'd like
2. **Use Case**: Explain why this feature would be useful
3. **Proposed Implementation**: If you have ideas for implementation
4. **Alternatives**: Any alternative solutions you've considered

## 🔧 Types of Contributions

### Code Contributions
- Bug fixes
- New features
- Performance improvements
- Code refactoring
- Documentation updates

### Non-Code Contributions
- Documentation improvements
- Bug reports
- Feature requests
- Testing
- Design improvements

## 🧪 Testing Guidelines

### Backend Testing
- Test API endpoints with various inputs
- Test edge cases and error conditions
- Ensure 4-decimal precision handling
- Test with different fault scenarios

### Frontend Testing
- Test on different browsers
- Test responsive design on various screen sizes
- Test form validation
- Test chart rendering

### Manual Testing Checklist
- [ ] Application starts without errors
- [ ] Form inputs accept 4-decimal precision values
- [ ] Predictions are returned correctly
- [ ] Charts render properly
- [ ] Responsive design works on mobile
- [ ] Error handling works as expected

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No merge conflicts
- [ ] Clear commit messages

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## 🏷️ Commit Message Guidelines

Use clear, descriptive commit messages:

```
Add: 4-decimal precision support for complex values
Fix: Division error in feature generation
Update: README with GitHub setup instructions
Refactor: Backend prediction logic
Docs: Add API documentation examples
```

## 🚀 Release Process

1. **Version Bumping**: Update version numbers in relevant files
2. **Changelog**: Update CHANGELOG.md with new features/fixes
3. **Testing**: Comprehensive testing before release
4. **Documentation**: Update documentation if needed
5. **Tagging**: Create a git tag for the release

## 📞 Getting Help

If you need help:

1. **Check Documentation**: Read the README.md and code comments
2. **Search Issues**: Check existing GitHub issues
3. **Create Issue**: Open a new issue if needed
4. **Community**: Join discussions in issues

## 🎉 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Thank you for contributing to the Power Fault Prediction System! Your contributions help make electrical grid monitoring more intelligent and reliable.

---

**Happy Contributing! 🚀**
