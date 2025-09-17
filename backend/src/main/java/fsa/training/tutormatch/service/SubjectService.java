package fsa.training.tutormatch.service;

import fsa.training.tutormatch.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectService {
    @Autowired
    private SubjectRepository  subjectRepository;
    public List<String> getAllSubjects() {
        return subjectRepository.findAll().stream().map(subject -> subject.getName()).collect(Collectors.toList());
    }
}
